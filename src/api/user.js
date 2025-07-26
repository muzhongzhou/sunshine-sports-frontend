import axios from './axios';

export function registerAPI(data) {
    return axios.post('/user/register', data);
}

export function loginAPI(data) {
    return axios.post('/user/login', data);
}
