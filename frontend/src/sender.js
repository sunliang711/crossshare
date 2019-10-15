import React from 'react';

export default props => {
    return (
        <div>
            <textarea ></textarea>
            <button onClick={props.onClick}>send</button>
        </div>
    )
}