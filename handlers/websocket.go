package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"github.com/sunliang711/crossshare/utils"
)

// UserEventConns TODO
// 2019/10/12 17:21:55
type UserEventConns struct {
	conns map[string]map[string][]*userConn
}

// userConn TODO
// 2019/10/12 20:42:17
type userConn struct {
	Conn     *websocket.Conn
	User     string
	LastPing int64
}

// NewUserEventConns TODO
// 2019/10/12 17:23:41
func NewUserEventConns() *UserEventConns {
	uec := &UserEventConns{
		conns: make(map[string]map[string][]*userConn),
	}
	go uec.Check()
	return uec
}

// Add TODO
// 2019/10/12 17:22:47
func (c *UserEventConns) Add(user string, event string, conn *userConn) {
	eventConns, exist := c.conns[user]
	if !exist {
		eventConns = make(map[string][]*userConn)
	}
	eventConns[event] = append(eventConns[event], conn)
	c.conns[user] = eventConns
}

// Remove TODO
// 2019/10/12 17:26:45
func (c *UserEventConns) Remove(user string, event string, conn *userConn) {
	eventConns, exist := c.conns[user]
	if !exist {
		return
	}
	conns, exist := eventConns[event]
	if !exist {
		return
	}
	indexOfConn := -1
	for i := range conns {
		if conns[i] == conn {
			indexOfConn = i
			break
		}
	}
	if indexOfConn >= 0 && indexOfConn < len(conns) {
		conns[indexOfConn].Conn.Close()
		conns = append(conns[:indexOfConn], conns[indexOfConn:]...)
		eventConns[event] = conns
		c.conns[user] = eventConns
	}
}

//Push TODO
// 2019/10/12 17:48:15
func (c *UserEventConns) Push(user string, event string, message []byte) {
	eventConns, exist := c.conns[user]
	if !exist {
		return
	}
	conns, exist := eventConns[event]
	if !exist {
		return
	}
	for i := range conns {
		err := conns[i].Conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Infof("Remove user: %v event: %v conns: %v", user, event, i)
			c.Remove(user, event, conns[i])
		}
	}
}

// Check TODO
// 2019/10/12 20:00:28
func (c *UserEventConns) Check() {
	go func(c *UserEventConns) {
		// check every conns's PING packet
		ticker := time.NewTicker(time.Duration(viper.GetInt("check_interval")) * time.Second)
		for {
			select {
			case <-ticker.C:
				log.Infof("check...")
				c.check()
			}
		}
	}(c)
}

// check TODO
// 2019/10/12 20:55:31
func (c *UserEventConns) check() {
	for user, eventConns := range c.conns {
		for event, conns := range eventConns {
			for _, conn := range conns {
				if time.Now().Unix()-conn.LastPing > viper.GetInt64("expire_limit") {
					log.Infof("conn of user: %v with event: %v expired,remove it", user, event)
					c.Remove(user, event, conn)
				}
			}
		}
	}

}

var userEventConns = NewUserEventConns()

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// message TODO
// 2019/10/12 17:01:58
type message struct {
	Token string `json:"token"`
	Event string `json:"event"`
}

// Websocket TODO
// 2019/10/12 16:36:04
func Websocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		msg := fmt.Sprintf("upgrade to websocket error: %v", err)
		log.Error(msg)
		c.JSON(500, gin.H{
			"code": 1,
			"msg":  msg,
		})
		return
	}
	var user string
	for {
		_, data, err := conn.ReadMessage()
		if err != nil {
			msg := fmt.Sprintf("read message from client error: %v", err)
			log.Error(msg)
			conn.Close()
			return
		}
		var clientMsg message
		r := bytes.NewReader(data)
		err = json.NewDecoder(r).Decode(&clientMsg)
		if err != nil {
			msg := fmt.Sprintf("decode subscribe message error: %v", err)
			log.Error(msg)
			conn.WriteMessage(websocket.TextMessage, []byte("not json"))
			continue
		}
		log.Infof("subscribe data: %+v", clientMsg)

		switch clientMsg.Event {
		case "PING":
			//TODO get username instead of RemoteAddr
			log.Infof("Get PING from %v", user)
			conn.WriteMessage(websocket.TextMessage, []byte("PONG"))
		default:
			// parse token
			t, err := utils.ParseToken(clientMsg.Token, []byte(viper.GetString("jwt_key")))
			if err != nil {
				msg := fmt.Sprintf("parse token error: %v", err)
				log.Error(msg)
				conn.Close()
				return
			}
			user = t.Claims.(jwt.MapClaims)["user"].(string)
			log.Infof("New clientMsg user: %v", user)

			userEventConns.Add(user, clientMsg.Event, &userConn{conn, user, time.Now().Unix()})
		}

	}

}
