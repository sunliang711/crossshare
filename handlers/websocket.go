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
	Conn      *websocket.Conn
	User      string
	LastPing  int64
	CloseChan chan struct{}
}

const (
	eventPing                 = "PING"
	eventPong                 = "PONG"
	eventAll                  = "ALL"
	eventTokenInvalid         = "TokenInvalid"
	eventMessageFormatInvalid = "MsgFormatInvalid"
)

// pongPacket TODO
// 2019/10/13 16:56:38
func pongPacket() message {
	return message{Event: eventPong}
}

// tokenInvalidPacket TODO
// 2019/10/14 10:25:18
func tokenInvalidPacket() message {
	return message{Event: eventTokenInvalid}
}

func messageFormatInvalidPacket() message {
	return message{Event: eventMessageFormatInvalid}
}

// ReadLoop TODO
// 2019/10/12 23:30:08
func (uc *userConn) ReadLoop() {
	for {
		select {
		case <-uc.CloseChan:
			log.Debugf("Close readLoop of user: %v", uc.User)
			return
		default:
			_, data, err := uc.Conn.ReadMessage()
			if err != nil {
				log.Errorf("read data from user: %v error: %v", uc.User, err)
				continue
			}
			var clientMsg message
			r := bytes.NewReader(data)
			err = json.NewDecoder(r).Decode(&clientMsg)
			if err != nil {
				log.Error("decode msg from user: %v error: %v", uc.User, err)
				continue
			}
			switch clientMsg.Event {
			case eventPing:
				log.Debugf("Get PING from %v", uc.User)
				pong := pongPacket()
				pkt, _ := json.Marshal(&pong)
				uc.Conn.WriteMessage(websocket.TextMessage, pkt)
				userEventConns.updatePingTime(uc.User, uc.Conn)
			default:
				//other event for future use
			}
		}
	}

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
		close(conns[indexOfConn].CloseChan)

		conns = append(conns[:indexOfConn], conns[indexOfConn+1:]...)
		eventConns[event] = conns
		c.conns[user] = eventConns
	}
}

//Push TODO
// 2019/10/12 17:48:15
func (c *UserEventConns) Push(user string, event string, msg string) {
	eventConns, exist := c.conns[user]
	if !exist {
		return
	}

THERE:
	log.Debugf(`Push event: "%v"`, event)
	conns, exist := eventConns[event]
	if !exist {
		return
	}
	for i := range conns {
		eventPkt := message{Event: event, Message: msg}
		pkt, _ := json.Marshal(&eventPkt)
		err := conns[i].Conn.WriteMessage(websocket.TextMessage, pkt)
		if err != nil {
			log.Infof("Remove user: %v event: %v conns: %v", user, event, i)
			c.Remove(user, event, conns[i])
		}
	}

	// push eventAll
	if event != eventAll {
		event = eventAll
		goto THERE
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
				log.Debugf("check...")
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
					log.Infof("Remove expired conn: %v, user: %v, event: %v", conn.Conn.RemoteAddr(), user, event)
					c.Remove(user, event, conn)
				}
			}
		}
	}
}

// updatePingTime TODO
// 2019/10/12 22:19:01
func (c *UserEventConns) updatePingTime(user string, wsConn *websocket.Conn) {
	if eventConns, exist := c.conns[user]; exist {
		for event, conns := range eventConns {
			for _, conn := range conns {
				if conn.Conn == wsConn {
					conn.LastPing = time.Now().Unix()
					log.Debugf("Update Ping time of user: %v event: %v", user, event)
					return
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
	Token   string `json:"token,omitempty"`
	Event   string `json:"event"`
	Message string `json:"message,omitempty"`
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
		msgFormatInvalid := messageFormatInvalidPacket()
		pkt, _ := json.Marshal(msgFormatInvalid)
		conn.WriteMessage(websocket.TextMessage, pkt)
		log.Error(string(pkt))
		return
	}

	event := clientMsg.Event
	if event == eventPing {
		msg := fmt.Sprintf("Must register event before PING")
		log.Error(msg)
		conn.Close()
		return
	}

	t, err := utils.ParseToken(clientMsg.Token, []byte(viper.GetString("jwt_key")))
	if err != nil {
		msg := fmt.Sprintf("parse token error: %v", err)
		log.Error(msg)
		tokenInvalidPkt := tokenInvalidPacket()
		pkt, _ := json.Marshal(tokenInvalidPkt)
		conn.WriteMessage(websocket.TextMessage, pkt)
		conn.Close()
		return
	}

	user := t.Claims.(jwt.MapClaims)["user"].(string)
	log.Infof("New clientMsg from user: %v with event: %v", user, event)

	uConn := &userConn{
		Conn:      conn,
		User:      user,
		LastPing:  time.Now().Unix(),
		CloseChan: make(chan struct{}),
	}
	userEventConns.Add(user, event, uConn)

	uConn.ReadLoop()
}
