// src/router/index.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // 导入 useAuth Hook

// 导入页面组件
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import HomePage from '../pages/HomePage';
import VenueDetailPage from '../pages/VenueDetailPage';
import OrderPage from '../pages/OrderPage';
import PersonalPage from '../pages/PersonalPage';
import NotFoundPage from '../pages/NotFoundPage';
import VenueManagementPage from '../pages/Teacher/VenueManagementPage';

const AppRouter = () => {
    const { token, user, isLoading } = useAuth();

    // 在加载时显示一个加载状态
    if (isLoading) {
        return <div>加载中...</div>;
    }

    // 老师专属路由的保护组件
    const ProtectedTeacherRoute = ({ children }) => {
        if (!token || user?.role !== 'teacher') {
            // 如果未登录或非老师身份，重定向到登录页
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    // 所有登录用户可访问的路由的保护组件
    const PrivateRoute = ({ children }) => {
        if (!token) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 需要登录才能访问的路由 */}
            <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/venue/:vid" element={<PrivateRoute><VenueDetailPage /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrderPage /></PrivateRoute>} />
            <Route path="/personal" element={<PrivateRoute><PersonalPage /></PrivateRoute>} />

            {/* **新增：只有老师身份才能访问的路由** */}
            <Route
                path="/teacher/venues"
                element={<ProtectedTeacherRoute><VenueManagementPage /></ProtectedTeacherRoute>}
            />

            {/* 默认跳转到首页 */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 404 页面 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default AppRouter;