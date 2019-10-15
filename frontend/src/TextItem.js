import React from "react";
import ReactDOM from "react-dom";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import "./TextItem.css"

export default props => {
    return (
        <li className="textItem">
            <CopyToClipboard onCopy={props.onCopy} text={props.text}>
                <button className="copyBtn">{props.copyButtonText || "copy"}</button>
            </CopyToClipboard>
            <button className="deleteBtn" onClick={props.onDelete}>
                {props.deleteButtonText || "delete"}
            </button>
            {props.text}
            <span className="status">
                {props.status}
            </span>
        </li>
    )
}

