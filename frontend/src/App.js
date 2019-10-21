import React from "react";

import { w3cwebsocket as W3CWebSocket } from 'websocket';
import axios from 'axios';
import TextItem from './TextItem'
import Login from './Login'
import Sender from './sender'
import config from "./config"
import Logout from './logout'
import { push } from './api'
import Button from "@material-ui/core/Button"

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
        this.state = initialState

        this.timerID = null
        this.wsclient = null
    }
    onCopy = (i) => {
        const { status } = this.state
        for (let j = 0; j < status.length; j++) {
            if (j === i) {
                status[j] = ' Copied'
            } else {
                status[j] = ' '
            }
        }
        console.log(`texts: ${JSON.stringify(this.state.texts)}`)
        console.log(`status: ${JSON.stringify(status)}`)
        this.setState({ status })
    }
    delete = (i) => {
        console.log(`delete i: ${i}`)
        let texts = this.state.texts.slice()
        texts.splice(i, 1)
        let status = this.state.status.slice()
        status.splice(i, 1)
        console.log(`texts: ${JSON.stringify(texts)}`)
        console.log(`status: ${JSON.stringify(status)}`)
        this.setState({ texts, status })
    }
    loginCallback = (user, token) => {
        this.setState({ token, isLogin: true, user })
        console.log(`this.state: ${JSON.stringify(this.state)}`)
        this.websocketHandler()
    }
    websocketHandler = () => {
        this.wsclient = new W3CWebSocket(config.wserver)
        this.wsclient.onopen = () => {
            console.log("websocket client connected");
            this.wsclient.send(JSON.stringify({ token: this.state.token, event: "text" }))
            this.timerID = setInterval(() => { this.wsclient.send('{"event":"PING"}'); }, config.pingInterval)
        };
        this.wsclient.onmessage = (message) => {
            console.log(message)
            let data = JSON.parse(message.data)
            if (data.event !== 'PONG') {
                // if (data.event === 'text' || data.event === 'file') {
                let texts = this.state.texts
                // texts.push(message.data)
                texts = texts.concat([message.data])
                let status = this.state.status.slice()
                status.push('')

                this.setState({ texts, status })

            }
        };
        this.wsclient.onerror = () => {
            console.log('websocket on error')
            this.setState({ isLogin: false })
        }
        this.wsclient.onclose = () => {
            console.log('websocket closed')
            clearInterval(this.timerID)
            this.setState({ isLogin: false })
        }

    }
    send = (text) => {
        console.log(`send ${text}`)
        const headers = {
            "Content-Type": "application/json",
            "token": this.state.token
        }
        const data = { event: "text", "message": text }
        push({ headers }, data).then(res => {
            console.log(`res: ${JSON.stringify(res.data)}`)
        })

    }
    logout = () => {
        console.log('logout')
        clearInterval(this.timerID)
        this.wsclient.close()
        this.wsclient = null
        this.setState(initialState)
    }

    clearAll = () => {
        this.setState({ texts: [], status: [] })
    }
    render() {
        const { isLogin, user, status } = this.state
        let loginOrGreeting = <Login callback={this.loginCallback} />
        if (isLogin) {
            loginOrGreeting = <Logout user={user} onClick={this.logout} />
        }
        return (
            <div>
                {loginOrGreeting}
                <Sender disable={!isLogin} onClick={this.send}></Sender>
                {this.state.texts.length > 0 ? <Button className="clearAll" variant="contained" color="primary" onClick={this.clearAll}>clearAll</Button> : null}
                <ul>
                    {
                        this.state.texts.map((text, i) => {
                            let t = JSON.parse(text)
                            return (
                                <TextItem
                                    id={i} key={i}
                                    onCopy={this.onCopy.bind(this, i)}
                                    text={t.message}
                                    onDelete={() => { this.delete(i) }}
                                    status={status[i]}
                                ></TextItem>
                            )
                        })
                    }
                </ul>
            </div>
        )
    }
}


// ReactDOM.render(<App />, document.getElementById("app"));
export default App;
