package models

import (
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/sunliang711/crossshare/types"

	"database/sql"
	// register mysql driver
	_ "github.com/go-sql-driver/mysql"
)

var (
	db *sql.DB
)

// InitDB TODO
// 2019/10/11 18:36:22
func InitDB(datasource string) {
	var err error
	db, err = sql.Open("mysql", datasource)
	if err != nil {
		panic(fmt.Sprintf("Open database %v failed: %v", datasource, err))
	}
	err = db.Ping()
	if err != nil {
		panic(fmt.Sprintf("Ping db failed: %v", err))
	}
	log.Infof("Database connected")
}

// Register registers user
// 2019/10/11 17:21:09
func Register(user *types.User) (err error) {
	sql := "insert into user(user,password,email) values(?,?,?)"
	_, err = db.Exec(sql, user.User, user.Password, user.Email)
	return
}

// Login for user login
// 2019/10/11 17:21:26
func Login(user *types.User) (err error) {
	var rows *sql.Rows
	sql := "select password from user where user = ?"
	rows, err = db.Query(sql, user.User)
	if err != nil {
		return err
	}
	if rows.Next() {
		var password string
		rows.Scan(&password)
		if password != user.Password {
			err = fmt.Errorf("User and password not match")
			return
		}
		return nil
	}
	err = fmt.Errorf("No such user")
	return
}
