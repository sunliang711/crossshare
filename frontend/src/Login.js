import React from 'react';

export default (props) => {
    return (
        <div>
            <input name="user" placeholder="user" />
            <input name="password" placeholder="password" type="password" />
            <button onClick={props.onClick}>submit</button>
        </div>
    )
}