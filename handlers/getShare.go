package handlers

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"github.com/sunliang711/crossshare/utils"
)

// GetShare TODO
// 2019/10/12 15:54:08
func GetShare(c *gin.Context) {
	t, _ := utils.ParseToken(c.GetHeader("token"), []byte(viper.GetString("")))
	user := t.Claims.(jwt.MapClaims)["user"]
	c.JSON(200, gin.H{
		"code": 0,
		"msg":  "ok",
		"user": user,
	})
}
