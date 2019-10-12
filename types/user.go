package types

// User TODO
// 2019/10/11 17:24:39
type User struct {
	ID       int    `json:"id"`
	User     string `json:"user"`
	Password string `json:"password"`
	Email    string `json:"email"`
}
