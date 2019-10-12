package handlers

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"github.com/sunliang711/crossshare/utils"
)

// ParseToken TODO
// 2019/10/12 15:45:26
func ParseToken(c *gin.Context) {
	token := c.Request.Header.Get("token")
	_, err := utils.ParseToken(token, []byte(viper.GetString("jwt_key")))
	if err != nil {
		c.JSON(400, gin.H{
			"code": 1,
			"msg":  fmt.Sprintf("token error: %v", err),
		})
		c.Abort()
	}
	c.Next()
}
