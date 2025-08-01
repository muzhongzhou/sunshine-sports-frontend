// src/contexts/AuthContext.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from './auth'; // 从新的文件导入 AuthContext
import api from '../services/api';

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserInfo = async () => {
        if (token) {
            try {
                const response = await api.get('/user/info');

                const fetchedUser = response.data.data;

                if (!fetchedUser || !fetchedUser.name || !fetchedUser.role) {
                    console.error('User data is incomplete or missing.');
                }

                if (fetchedUser.role === '学生') {
                    fetchedUser.role = 'student';
                } else if (fetchedUser.role === '老师') {
                    fetchedUser.role = 'teacher';
                }

                setUser(fetchedUser);

            } catch (error) {
                console.error('获取用户信息失败:', error);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        fetchUserInfo();
    };

    const logout = async () => {
        try {
            await api.post('/personal/logout');
        } catch (error) {
            console.error('退出登录请求失败:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};