// src/services/api.js
import axios from 'axios';
import history from '../router/history'; // 导入我们创建的 history 对象

const API_BASE_URL = 'http://localhost:7001';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('认证失败或Token过期，请重新登录。');
            localStorage.removeItem('token');

            // 使用 history.push 进行编程式导航，不刷新页面
            history.push('/login');
        }
        return Promise.reject(error);
    }
);

export default api;