package handlers

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"github.com/sunliang711/crossshare/models"
	"github.com/sunliang711/crossshare/types"
	"github.com/sunliang711/crossshare/utils"
)

// Login TODO
// 2019/10/12 14:56:07
func Login(c *gin.Context) {
	var user types.User
	err := c.BindJSON(&user)
	if err != nil {
		log.Error(types.ErrBadRequest)
		c.JSON(200, gin.H{
			"code": 1,
			"msg":  types.ErrBadRequest,
		})
		return
	}
	log.Infof("login user: %+v", user)
	err = models.Login(&user)
	if err != nil {
		log.Error(err)
		c.JSON(200, gin.H{
			"code": 1,
			"msg":  err.Error(),
		})
		return
	}
	token, err := utils.GenToken([]byte(viper.GetString("jwt_key")), map[string]interface{}{
		"user": user.User,
		"exp":  time.Now().Add(time.Duration(viper.GetInt("expire")) * 60 * time.Second).Unix(),
	})
	if err != nil {
		msg := fmt.Sprintf("gen token error: %v", err)
		log.Error(msg)
		c.JSON(500, gin.H{
			"code": 1,
			"msg":  msg,
		})
		return
	}
	log.Infof("login success")
	c.JSON(200, gin.H{
		"code":  0,
		"msg":   "Login success",
		"token": token,
	})
}
