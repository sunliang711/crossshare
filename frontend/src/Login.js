import React from 'react';
import config from "./config"
import axios from 'axios';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import "./Login.css"

// const Login2 = props => {
//     const [user, setUser] = useState('');
//     const [password, setPassowrd] = useState('');
//     const [status, setStatus] = useState('');

//     const submit = (callback) => {
//         const headers = {
//             "Content-Type": "application/json"
//         }
//         const data = {
//             user: user,
//             password: password,
//         }
//         console.log(`data: ${JSON.stringify(data)}`)
//         axios.post(config.restServer + "/login", data, headers).then(
//             res => {
//                 if (res.data.code === 0) {
//                     callback(user, res.data.token)
//                 } else {
//                     console.log("login failed")
//                     setStatus(res.data.msg)
//                 }
//             }
//         )
//     }
//     const handleChange = name => (e) => {
//         console.log('handleChange called')
//         // this.setState({ [e.target.name]: e.target.value })
//         if (name === 'user') {
//             setUser(e.target.value)
//         } else if (name === 'password') {
//             setPassowrd(e.target.value)
//         }
//     }
//     return (
//         <div>
//             <form className="loginForm" noValidate autoComplete="off">
//                 <TextField
//                     id="user"
//                     label="user"
//                     onChange={handleChange('user')}
//                     margin="normal"
//                     variant="outlined"
//                 />
//                 <TextField
//                     id="password"
//                     label="password"
//                     type="password"
//                     onChange={handleChange('password')}
//                     margin="normal"
//                     variant="outlined"
//                 />
//                 <Button variant="contained" color="primary" onClick={submit(props.callback)}>submit</Button>
//                 <span className="loginStatus">{status}</span>

//             </form>
//         </div>
//     )
// }

class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            user: "",
            password: "",
            status: '',
            rememberMe: '',
        }
        // this.handleChange = this.handleChange.bind(this)
    }
    componentDidMount() {
        const rememberMe = localStorage.getItem("rememberMe") === "true"
        this.setState({ rememberMe })
        console.log("rememberMe: ", rememberMe)
        if (rememberMe) {
            const user = localStorage.getItem("user")
            console.log("user: ", user)
            this.setState({ user })
        }
    }
    handleChange = name => (e) => {
        // console.log('handleChange called')
        // this.setState({ [e.target.name]: e.target.value })
        if (e.target.type === 'checkbox') {
            this.setState({ [name]: e.target.checked })
        } else {
            this.setState({ [name]: e.target.value })
        }
        // console.log(`this.state: ${JSON.stringify(this.state)}`)
    }
    render() {
        return (
            // <div>
            //     <input name="user" placeholder="user" onChange={this.handleChange} />
            //     <input name="password" placeholder="password" type="password" onChange={this.handleChange} />
            //     <button onClick={this.submit.bind(this, this.props.callback)}>submit</button>
            //     <span className="loginStatus">{this.state.status}</span>
            // </div>
            <div>
                <form className="loginForm" noValidate autoComplete="off">
                    <TextField
                        id="user"
                        label="user"
                        onChange={this.handleChange('user')}
                        margin="normal"
                        variant="outlined"
                        value={this.state.user}
                    />
                    <TextField
                        id="password"
                        label="password"
                        type="password"
                        onChange={this.handleChange('password')}
                        margin="normal"
                        variant="outlined"
                    />
                    <FormControlLabel className="rememberPar"
                        control={
                            <Checkbox
                                className="rememberMe"
                                checked={this.state.rememberMe}
                                onChange={this.handleChange('rememberMe')}
                                color="primary"
                                value={this.state.rememberMe}
                            />
                        }
                        label="remember user"
                    />
                    <Button className="submitBtn" disabled={this.state.user === '' || this.state.password === ''} variant="contained" color="primary" onClick={this.submit.bind(this, this.props.callback)}>submit</Button>
                    <span className="loginStatus">{this.state.status}</span>

                </form>
            </div>
        )
    }
    submit = (callback) => {
        const headers = {
            "Content-Type": "application/json"
        }
        const data = {
            user: this.state.user,
            password: this.state.password
        }
        console.log(`data: ${JSON.stringify(data)}`)
        axios.post(config.restServer + "/login", data, headers).then(
            res => {
                console.log(`/login,response: ${JSON.stringify(res.data)}`)
                if (res.data.code === 0) {
                    callback(this.state.user, res.data.token)
                    const { rememberMe } = this.state
                    localStorage.setItem("rememberMe", rememberMe === true)
                    if (rememberMe) {
                        localStorage.setItem("user", this.state.user)
                    } else {
                        localStorage.removeItem("user")
                    }
                } else {
                    console.log("login failed")
                    this.setState({ status: res.data.msg })
                }
            }
        )
    }
}

export default Login;