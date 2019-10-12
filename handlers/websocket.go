package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

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
	conns map[string]map[string][]*websocket.Conn
}

// NewUserEventConns TODO
// 2019/10/12 17:23:41
func NewUserEventConns() *UserEventConns {
	return &UserEventConns{
		conns: make(map[string]map[string][]*websocket.Conn),
	}
}

// Add TODO
// 2019/10/12 17:22:47
func (c *UserEventConns) Add(user string, event string, conn *websocket.Conn) {
	eventConns, exist := c.conns[user]
	if !exist {
		eventConns = make(map[string][]*websocket.Conn)
	}
	eventConns[event] = append(eventConns[event], conn)
	c.conns[user] = eventConns
}

// Remove TODO
// 2019/10/12 17:26:45
func (c *UserEventConns) Remove(user string, event string, conn *websocket.Conn) {
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
		err := conns[i].WriteMessage(websocket.TextMessage, message)
		if err != nil {
			c.Remove(user, event, conns[i])
		}
	}
}

var userEventConns = NewUserEventConns()

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// subscribe TODO
// 2019/10/12 17:01:58
type subscribe struct {
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
	for {
		// read token
		_, data, err := conn.ReadMessage()
		if err != nil {
			msg := fmt.Sprintf("read token msg error: %v", err)
			log.Error(msg)
			c.JSON(500, gin.H{
				"code": 1,
				"msg":  msg,
			})
			return
		}
		var sub subscribe
		r := bytes.NewReader(data)
		err = json.NewDecoder(r).Decode(&sub)
		if err != nil {
			msg := fmt.Sprintf("decode subscribe message error: %v", err)
			log.Error(msg)
			c.JSON(400, gin.H{
				"code": 1,
				"msg":  msg,
			})
			return
		}
		log.Infof("subscribe data: %+v", sub)

		// parse token
		t, err := utils.ParseToken(sub.Token, []byte(viper.GetString("jwt_key")))
		if err != nil {
			msg := fmt.Sprintf("parse token error: %v", err)
			log.Error(msg)
			c.JSON(400, gin.H{
				"code": 1,
				"msg":  msg,
			})
			return
		}
		user := t.Claims.(jwt.MapClaims)["user"].(string)
		log.Infof("sub user: %v", user)

		//TODO: when write to this conn,remove it
		userEventConns.Add(user, sub.Event, conn)
	}

}
