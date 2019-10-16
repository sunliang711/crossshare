import React from "react";
import ReactDOM from "react-dom";

import { w3cwebsocket as W3CWebSocket } from 'websocket';
import axios from 'axios';
import TextItem from './TextItem'
import Login from './Login'
import Sender from './sender'
import config from "./config"
import Logout from './logout'
import { push } from './api'

// const client = new W3CWebSocket(config.wserver)
const initialState = {
    token: "",
    isLogin: false,
    texts: [],
    status: [],
    user: "",
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = { ...initialState }

        this.loginCallback = this.loginCallback.bind(this)
        this.websocketHandler = this.websocketHandler.bind(this)
        this.logout = this.logout.bind(this)
        this.send = this.send.bind(this)
        this.timer = null
        this.wsclient = null
    }
    componentWillMount() {
        // this.websocketHandler()
    }
    onCopy(i) {
        let status = this.state.status
        for (let j = 0; j < status.length; j++) {
            if (j === i) {
                status[j] = ' Copied'
            } else {
                status[j] = ' '
            }
        }
        console.log(`texts: ${JSON.stringify(this.state.texts)}`)
        console.log(`status: ${JSON.stringify(status)}`)
        this.setState({ ...this.State, status })
    }
    delete(i) {
        console.log(`delete i: ${i}`)
        let texts = this.state.texts
        texts.splice(i, 1)
        let status = this.state.status
        status.splice(i, 1)
        console.log(`texts: ${JSON.stringify(texts)}`)
        console.log(`status: ${JSON.stringify(status)}`)
        this.setState({ ...this.state, texts, status })
    }
    loginCallback(user, token) {
        this.setState({ token: token, isLogin: true, user: user })
        console.log(`this.state: ${JSON.stringify(this.state)}`)
        this.websocketHandler()
    }
    // componentDidUpdate() {
    //     if (this.state.isLogin) {
    //         console.log('update')
    //         this.timer = setInterval(() => {
    //             console.log(`isLogin:${this.state.isLogin}`)
    //             console.log('interval()')
    //             this.wsclient.send(JSON.stringify({ event: "PING" }))
    //         }, config.pingInterval);
    //     }
    // }
    websocketHandler() {
        this.wsclient = new W3CWebSocket(config.wserver)
        this.wsclient.onopen = () => {
            console.log("websocket client connected");
            this.wsclient.send(JSON.stringify({ token: this.state.token, event: "text" }))
            this.timer = setInterval(() => { this.wsclient.send('{"event":"PING"}'); }, config.pingInterval)
        };
        this.wsclient.onmessage = (message) => {
            console.log(message)
            let data = JSON.parse(message.data)
            if (data.event !== 'PONG') {
                // if (data.event === 'text' || data.event === 'file') {
                let texts = this.state.texts
                texts.push(message.data)
                let status = this.state.status
                status.push('')

                this.setState({ ...this.state, texts, status })

            }
        };
        this.wsclient.onclose = () => {
            clearInterval(this.timer)
        }

    }
    send(text) {
        console.log(`send ${text}`)
        const headers = {
            "Content-Type": "application/json",
            "token": this.state.token
        }
        const url = config.restServer + "/push"
        const data = { event: "text", "message": text }
        // axios.post(url, data, { headers: headers }).then(res => {
        //     console.log(`res: ${JSON.stringify(res)}`)
        // })
        push({ headers: headers }, data).then(res => {
            console.log(`res: ${JSON.stringify(res)}`)
        })

    }
    logout() {
        console.log('logout')
        // clearInterval(this.state.interval)
        clearInterval(this.timer)
        this.wsclient.close()
        this.wsclient = null
        this.setState({ ...initialState, texts: [], status: [] })
    }
    render() {
        let loginOrGreeting = <Login callback={this.loginCallback} />
        if (this.state.isLogin) {
            loginOrGreeting = <Logout user={this.state.user} onClick={() => { this.logout() }} />
        }
        console.log(`texts: ${JSON.stringify(this.state.texts)}`)
        return (
            <div>
                {loginOrGreeting}
                <Sender disable={!this.state.isLogin} onClick={this.send}></Sender>
                <ul>
                    {
                        this.state.texts.map((text, i) => {
                            let t = JSON.parse(text)
                            return (
                                <TextItem
                                    id={i} key={i}
                                    onCopy={() => { this.onCopy(i) }}
                                    text={t.message}
                                    onDelete={() => { this.delete(i) }}
                                    status={this.state.status[i]}
                                ></TextItem>
                            )

                        })
                    }
                </ul>
            </div>
        )
    }
}


ReactDOM.render(<App />, document.getElementById("app"));
