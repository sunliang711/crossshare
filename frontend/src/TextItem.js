import React from "react";
import ReactDOM from "react-dom";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import "./TextItem.css"

export default props => {
    const copyElem = <CopyToClipboard
        onCopy={props.onCopy}
        text={props.text}>
        <button className="copyBtn">
            {props.copyButtonText || "copy"}
        </button>
    </CopyToClipboard>

    const deleteBtn =
        <button className="deleteBtn" onClick={props.onDelete}>
            {props.deleteButtonText || "delete"}
        </button>

    const status = <span className="status">
        {props.status}
    </span>
    return (
        <li className="textItem">
            {copyElem}
            {deleteBtn}
            {props.text}
            {status}
        </li>
    )
}

