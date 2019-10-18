import React from 'react';
import "./sender.css";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { styled } from '@material-ui/core/styles';

const MyButton = styled(Button)({
    top: 30,
    marginRight: '10px',
    marginLeft: '0px',
    width: '40px',
    height: '70px',
})

class Sender extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            text: ''
        }
        // this.textarea = null
        // this.handleChange = this.handleChange.bind(this)
    }
    handleChange = name => e => {
        this.setState({ [name]: e.target.value })
        // this.textarea = e.target
    }
    clear = () => {
        this.setState({ text: '' })
        // this.textarea.value = ''
    }
    render() {
        return (
            <div className="sender">
                <TextField
                    className="sendBox"
                    label="text"
                    margin="normal"
                    variant="outlined"
                    multiline
                    rows="4"
                    value={this.state.text}
                    onChange={this.handleChange('text')}
                />
                <MyButton className="sendBtn" variant="contained" color="primary" disabled={this.props.disable || this.state.text === ''} onClick={() => { this.props.onClick(this.state.text) }}>send</MyButton>
                <MyButton className="clearBtn" variant="contained" color="primary" disabled={this.state.text === ''} onClick={this.clear}>clear</MyButton>
            </div >
        )

    }
}

export default Sender;