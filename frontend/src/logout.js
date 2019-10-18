import React from 'react';
import Button from '@material-ui/core/Button'
import "./logout.css"

class Logout extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="logout">
                <span className="greeting"> Greeting {this.props.user}</span>
                <Button className="logoutBtn" variant="contained" color="primary" onClick={this.props.onClick}>logout</Button>
            </div>
        )
    }
}

export default Logout;