// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import AppRouter from './router';
import './index.css';
import 'antd/dist/reset.css';
import { AuthProvider } from './contexts/AuthContext';
import history from './router/history'; // 导入 history 对象

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HistoryRouter history={history}>
            <AuthProvider>
                <AppRouter />
            </AuthProvider>
        </HistoryRouter>
    </React.StrictMode>,
);