import React from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles';
import "./TextItem.css"

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
        top: 0
    }
}))
export default props => {
    const classes = useStyles();
    const copyElem = <CopyToClipboard
        onCopy={props.onCopy}
        text={props.text}>
        <Button
            variant="contained"
            color="primary"
            className={classes.button}>
            {props.copyButtonText || "copy"}
        </Button>
    </CopyToClipboard>

    const deleteBtn =
        <Button
            variant="contained"
            color="primary"
            className={classes.button} onClick={props.onDelete}>
            {props.deleteButtonText || "delete"}
        </Button>

    const text = <span className="text">{props.text}</span>
    const status = <span className="status">
        {props.status}
    </span>
    return (
        <li className="textItem">
            {copyElem}
            {deleteBtn}
            {text}
            {status}
        </li>
    )
}

