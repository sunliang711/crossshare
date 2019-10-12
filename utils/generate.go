package utils

import (
	"github.com/dgrijalva/jwt-go"
)

//GenToken generate jwt token signed by key
func GenToken(key []byte, claim map[string]interface{}) (string, error) {
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims(claim))
	tokenStr, err := t.SignedString(key)
	if err != nil {
		return "", err
	}
	return tokenStr, nil
}
