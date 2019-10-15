import React from "react";
import ReactDOM from "react-dom";

import { w3cwebsocket as W3CWebSocket } from 'websocket';
import axios from 'axios';
import TextItem from './TextItem'
// import { CopyToClipboard } from 'react-copy-to-clipboard';


// const TextItem = props => {
//     return (
//         <li>
//             <CopyToClipboard onCopy={props.onCopy} text={props.text}>
//                 <button>{props.copyButtonText || "copy"}</button>
//             </CopyToClipboard>
//             <button onClick={props.onDelete}>
//                 {props.deleteButtonText || "delete"}
//             </button>
//             {props.text}
//             <span>{props.status}</span>
//         </li>
//     )
// }

const client = new W3CWebSocket("ws://localhost:8989/ws")

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            interval: null,
            count: 0,
            texts: ["{\"event\":\"text\",\"message\":\"haha\"}"],
            status: [""],
        }
    }
    componentWillMount() {
        client.onopen = () => {
            console.log("websocket client connected");
            client.send('{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NzE4ODQ0OTcsInVzZXIiOiJlYWdsZSJ9.g6mE-SO5zloxJdiJkMy5kD4o2aWVyLVO6M9FS_Uh4JM","event":"text"}')
            this.state.interval = setInterval(function () { client.send('{"event":"PING"}'); }, 3000)

        };
        client.onmessage = (message) => {
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
        client.onclose = () => {
            clearInterval(this.state.interval)
        }
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

        const headers = {
            "Content-Type": "application/json",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NzE4ODQ0OTcsInVzZXIiOiJlYWdsZSJ9.g6mE-SO5zloxJdiJkMy5kD4o2aWVyLVO6M9FS_Uh4JM"
        }
        const url = "http://localhost:8989/push"
        const data = { event: "text", "message": "from axios post" }
        axios.post(url, data, { headers: headers }).then(res => {
            console.log(`res: ${JSON.stringify(res)}`)
        })
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
    render() {
        return (
            <div>
                <p>text</p>
                <ul>
                    {
                        this.state.texts.map((text, i) => {
                            let t = JSON.parse(text)
                            return (
                                // <li id={i} key={i}>
                                //     <CopyToClipboard
                                //         onCopy={() => { this.onCopy(i) }} text={t.message}>
                                //         <button>copy</button>
                                //     </CopyToClipboard>
                                //     <button onClick={() => { this.delete(i) }}> delete </button>
                                //     {t.message}
                                //     <span>{this.state.status[i]}</span>
                                // </li>
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
