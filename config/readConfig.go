package config

import (
	"fmt"

	"github.com/spf13/viper"
	"github.com/sunliang711/crossshare/models"
)

// init TODO
// 2019/10/08 18:41:04
func init() {
	viper.SetConfigName("config")
	viper.AddConfigPath(".")
	err := viper.ReadInConfig()
	if err != nil {
		panic(fmt.Sprintf("Read config: %v", err))
	}

	models.InitDB(viper.GetString("dsn"))
}
