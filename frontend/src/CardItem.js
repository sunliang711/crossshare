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

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
        top: 0
    },
    status: {
        color: 'green',
    }


}))

export default props => {
    const classes = useStyles();
    return (
        <div>
            {
                props.messages.map((message, index) =>
                    <Card className={classes.card}>
                        <CardContent>
                            <Typography className={classes.title} color="textSecondary" gutterBottom>
                                {dateFormat(new Date(message.timestamp * 1000), "HH:MM:ss yyyy/mm/dd")}
                            </Typography>
                            <Typography variant="h4" component="h2">
                                {message.message}
                            </Typography>
                            <Typography className={classes.status}>
                                {message.status}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <CopyToClipboard
                                onCopy={() => props.copyCallback(index)}
                                text={message.message}>
                                <Button variant="contained" color="primary" >Copy</Button>
                            </CopyToClipboard>
                            <Button variant="contained" color="primary" size="small" onClick={() => props.onDelete(index)}>Delete</Button>
                        </CardActions>
                    </Card>)
            }
        </div>
    )
}