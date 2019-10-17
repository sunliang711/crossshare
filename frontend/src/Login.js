import React from 'react';
import config from "./config"
import axios from 'axios';
import "./Login.css"

class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: "",
            password: "",
            status: '',
        }
        // this.handleChange = this.handleChange.bind(this)
    }
    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }
    render() {
        return (
            <div>
                <input name="user" placeholder="user" onChange={this.handleChange} />
                <input name="password" placeholder="password" type="password" onChange={this.handleChange} />
                <button onClick={() => { this.submit(this.props.callback) }}>submit</button>
                <span className="loginStatus">{this.state.status}</span>
            </div>
        )
    }
    submit(callback) {
        const headers = {
            "Content-Type": "application/json"
        }
        const data = {
            user: this.state.user,
            password: this.state.password
        }
        axios.post(config.restServer + "/login", data, headers).then(
            res => {
                console.log(`/login,response: ${JSON.stringify(res.data)}`)
                if (res.data.code === 0) {
                    callback(this.state.user, res.data.token)
                } else {
                    console.log("login failed")
                    this.setState({ status: res.data.msg })
                }
            }
        )
    }
}

export default Login;