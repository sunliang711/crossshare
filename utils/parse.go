package utils

import (
	"fmt"

	"github.com/dgrijalva/jwt-go"
)

// ParseToken TODO
// 2019/10/10 15:25:32
func ParseToken(token string, key []byte) (*jwt.Token, error) {
	t, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		return key, nil
	})

	if err != nil {
		switch err.(type) {
		case *jwt.ValidationError:
			vErr := err.(*jwt.ValidationError)
			switch vErr.Errors {
			case jwt.ValidationErrorExpired:
				err = fmt.Errorf("Token expired")
			default:
			}
		default:
		}
	}
	return t, err
}
