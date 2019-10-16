import axios from 'axios';

const url = "http://localhost:8989"

export const push = (headers, data) => {
    return axios.post(url + "/push", data, headers)
}