import axios from 'axios';
import config from './config'


const url = config.restServer

export const push = (headers, data) => {
    return axios.post(url + "/push", data, headers)
}