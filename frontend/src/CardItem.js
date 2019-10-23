import React from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import dateFormat from 'dateformat';
import 'typeface-roboto';
import { flexbox } from "@material-ui/system";

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
        top: 0
    },
    status: {
        color: 'green',
        height: '10px',
    },
    cardWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    card: {
        width: '48%',
        marginLight: '2%',
        marginRight: '1%',
        marginBottom: '1%',
    },
    title: {
        // textAlign: 'center',
    },
    message: {
        // color: 'blue',
        fontSize: '20px',
        height: '60px',
    },
    copyBtn: {
        top: 0,
        left: 0,
        width: '40%',
    },
    deleteBtn: {
        top: 0,
        width: '40%',
    },
    buttons: {
        display: 'flex',
        justifyContent: 'center',

    }


}))

export default props => {
    const classes = useStyles();
    return (
        <div className={classes.cardWrapper}>
            {
                props.messages.map((message, index) =>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography className={classes.title} color="textSecondary" gutterBottom>
                                {dateFormat(new Date(message.timestamp * 1000), "HH:MM:ss yyyy/mm/dd")}
                            </Typography>
                            <Typography className={classes.message} variant="h4" component="h2">
                                {message.message.length > 40 ? message.message.substring(0, 30) + "..." : message.message}
                            </Typography>
                            <Typography className={classes.status}>
                                {message.status}
                            </Typography>
                        </CardContent>
                        <CardActions className={classes.buttons}>
                            <CopyToClipboard
                                className={classes.copyBtn}
                                onCopy={() => props.copyCallback(index)}
                                text={message.message}>
                                <Button variant="contained" color="primary" >Copy</Button>
                            </CopyToClipboard>
                            <Button className={classes.deleteBtn} variant="contained" color="primary" size="small" onClick={() => props.onDelete(index)}>Delete</Button>
                        </CardActions>
                    </Card>)
            }
        </div>
    )
}