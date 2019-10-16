import React from 'react';

class Sender extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            textToBeSent: null
        }
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value })
    }
    render() {
        return (
            <div>
                <textarea name="textToBeSent" onChange={this.handleChange}></textarea>
                <button disabled={this.props.disable} onClick={() => { this.props.onClick(this.state.textToBeSent) }}>send</button>
            </div>
        )

    }
}

export default Sender;