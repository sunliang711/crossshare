package main

import (
	"fmt"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"

	// read config
	_ "github.com/sunliang711/crossshare/config"
	"github.com/sunliang711/crossshare/handlers"
	"github.com/sunliang711/crossshare/utils"
)

// 2019/10/08 18:36:30
func main() {
	ginLogger := viper.GetBool("gin_logger")
	enableCors := viper.GetBool("cors")
	port := viper.GetInt("port")
	logLevel := viper.GetString("log_level")

	log.SetLevel(utils.LogLevel(logLevel))

	gin.SetMode(gin.ReleaseMode)
	srv := gin.New()
	srv.Use(gin.Recovery())
	if ginLogger {
		log.Infof("Enable gin logger")
		srv.Use(gin.Logger())
	}
	if enableCors {
		log.Infof("Enable cors")
		corsCfg := cors.DefaultConfig()
		corsCfg.AllowAllOrigins = true
		corsCfg.AddAllowHeaders("token")
		srv.Use(cors.New(corsCfg))
	}
	// handler
	srv.POST("/login", handlers.Login)
	srv.POST("/register", handlers.Register)

	srv.GET("/ws", handlers.Websocket)
	// middleware
	srv.Use(handlers.ParseToken)
	srv.GET("/share", handlers.GetShare)
	srv.POST("/push", handlers.Push)

	addr := fmt.Sprintf(":%d", port)
	log.Infof("Listen on%v", addr)
	srv.Run(addr)
}
