import React from 'react';

class Logout extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                Greeting {this.props.user}<button onClick={this.props.onClick}>logout</button>
            </div>
        )
    }
}

export default Logout;