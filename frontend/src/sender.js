import React from 'react';

class Sender extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            textToBeSent: ''
        }
        // this.textarea = null
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value })
        // this.textarea = e.target
    }
    clear = () => {
        this.setState({ textToBeSent: '' })
        // this.textarea.value = ''
    }
    render() {
        return (
            <div>
                <textarea name="textToBeSent" value={this.state.textToBeSent} onChange={this.handleChange}></textarea>
                <button disabled={this.props.disable} onClick={() => { this.props.onClick(this.state.textToBeSent) }}>send</button>
                <button disabled={this.state.textToBeSent === ''} onClick={this.clear}>clear</button>
            </div>
        )

    }
}

export default Sender;