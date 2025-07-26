import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import HomePage from '../pages/HomePage.jsx';
import Activity from '../pages/ActivityPage.jsx';
import OrderPage from '../pages/OrderPage.jsx';
import Profile from '../pages/Profile.jsx';
import Login from '../pages/LoginPage.jsx';
import Register from '../pages/RegisterPage.jsx';
import VenueDetail from "../pages/VenueDetail.jsx";

import {
    SportsSoccer,
    CalendarToday,
    Receipt,
    AccountCircle
} from '@mui/icons-material';

function AppRoutes() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <Router>
            {/* 顶部导航 */}
            <nav className="bg-gradient-to-r from-green-600 to-teal-500 p-4 text-white flex flex-col md:flex-row justify-between items-center shadow-md">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <SportsSoccer className="text-2xl" />
                    <Link to="/" className="font-bold text-xl">阳光体育中心</Link>
                </div>

                <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                    {user ? (
                        <>
                            <Link
                                to="/activity"
                                className="flex items-center px-3 py-2 rounded-lg hover:bg-white/20 transition"
                            >
                                <CalendarToday className="mr-1" /> 活动报名
                            </Link>
                            <Link
                                to="/orders"
                                className="flex items-center px-3 py-2 rounded-lg hover:bg-white/20 transition"
                            >
                                <Receipt className="mr-1" /> 订单管理
                            </Link>
                            <Link
                                to="/profile"
                                className="flex items-center px-3 py-2 rounded-lg hover:bg-white/20 transition"
                            >
                                <AccountCircle className="mr-1" /> 个人中心
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
                            >
                                登录
                            </Link>
                            <Link
                                to="/register"
                                className="bg-white hover:bg-gray-100 text-green-700 px-4 py-2 rounded-lg transition"
                            >
                                注册
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* 路由配置 */}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/orders" element={<OrderPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/venue/:id" element={<VenueDetail />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
