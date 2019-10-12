package models

import (
	"testing"

	"github.com/sunliang711/crossshare/types"
)

// TestRegister TODO
// 2019/10/11 19:22:34
func TestRegister(t *testing.T) {
	datasource := "root@tcp(localhost)/cross_share"
	InitDB(datasource)
	t.Log("Database connected")

	user := &types.User{
		User:     "eagle2",
		Password: "1223",
		Email:    "test@163.com",
	}
	err := Register(user)
	if err != nil {
		t.Errorf("Register error: %v", err)
	} else {
		t.Log("Register OK")
	}
}

func TestLogin(t *testing.T) {
	datasource := "root@tcp(localhost)/cross_share"
	InitDB(datasource)
	t.Log("Database connected")

	user := &types.User{
		User:     "eagle2",
		Password: "1223",
	}
	err := Login(user)
	if err != nil {
		t.Errorf("Login error: %v", err)
	} else {
		t.Log("Login OK")
	}
}
