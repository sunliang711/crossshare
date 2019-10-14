package handlers

import (
	"encoding/json"
	"fmt"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"github.com/sunliang711/crossshare/utils"
)

// PushMessage TODO
// 2019/10/12 17:43:57
type PushMessage struct {
	Event   string `json:"event"`
	Message string `json:"message"`
}

// Push TODO
// 2019/10/12 17:40:26
func Push(c *gin.Context) {
	token := c.GetHeader("token")
	t, _ := utils.ParseToken(token, []byte(viper.GetString("jwt_key")))
	user := t.Claims.(jwt.MapClaims)["user"].(string)

	var pm PushMessage
	err := json.NewDecoder(c.Request.Body).Decode(&pm)
	if err != nil {
		msg := fmt.Sprintf("decode push message body error: %v", err)
		log.Error(msg)
		c.JSON(400, gin.H{
			"code": 1,
			"msg":  msg,
		})
		return
	}
	userEventConns.Push(user, pm.Event, pm.Message)
	c.JSON(200, gin.H{
		"code": 0,
		"msg":  "OK",
	})
}
