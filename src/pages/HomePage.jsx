import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    SportsSoccer ,
    Sports ,
    CalendarToday,
    Receipt,
    AccountCircle
} from '@mui/icons-material';

function HomePage() {
    const user = JSON.parse(localStorage.getItem("user"));
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:7001/venue/list', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setVenues(data.data.slice(0, 3));
                }
            } catch (err) {
                console.error('获取场馆失败:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVenues();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* 顶部欢迎区域 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-green-700 mb-2">阳光体育中心</h1>
                    <p className="text-gray-600">发现运动乐趣，开启健康生活</p>
                </div>

                {user ? (
                    <div className="bg-green-50 p-5 rounded-xl shadow-md mt-4 md:mt-0 w-full md:w-auto">
                        <div className="flex items-center">
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                            <div className="ml-4">
                                <h2 className="text-xl font-semibold">欢迎，{user.name}</h2>
                                <p className="text-gray-600">{user.role} · 电话: {user.phone}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-50 p-5 rounded-xl shadow-md mt-4 md:mt-0 w-full md:w-auto">
                        <p className="text-red-700 font-medium">您尚未登录</p>
                        <div className="mt-2 flex space-x-2">
                            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                                登录
                            </Link>
                            <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
                                注册
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* 功能快速入口 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Link to="/activity" className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center transition-all transform hover:-translate-y-1">
                    <CalendarToday className="text-4xl mb-3" />
                    <h3 className="text-xl font-bold mb-2">活动报名</h3>
                    <p className="text-center text-green-100">探索各类运动场馆，预约您喜欢的活动</p>
                </Link>

                <Link to="/orders" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center transition-all transform hover:-translate-y-1">
                    <Receipt className="text-4xl mb-3" />
                    <h3 className="text-xl font-bold mb-2">订单管理</h3>
                    <p className="text-center text-blue-100">
                        {user?.role === '学生' ? '查看和管理您的预订' : '审批学生订单'}
                    </p>
                </Link>

                <Link to="/profile" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center transition-all transform hover:-translate-y-1">
                    <AccountCircle className="text-4xl mb-3" />
                    <h3 className="text-xl font-bold mb-2">个人中心</h3>
                    <p className="text-center text-amber-100">管理个人信息和账户设置</p>
                </Link>
            </div>

            {/* 推荐体育场所 */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center">
                        <SportsSoccer className="mr-2 text-green-600" /> 推荐体育场所
                    </h2>
                    <Link to="/activity" className="text-green-600 hover:text-green-800 flex items-center">
                        查看全部 <span className="ml-1">→</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200 border-2 border-dashed rounded-xl w-full" />
                                <div className="p-5">
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                                    <div className="h-10 bg-gray-200 rounded mt-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : venues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {venues.map(venue => (
                            <div
                                key={venue.vid}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                            >
                                <div className="h-48 bg-gray-200 border-2 border-dashed rounded-xl w-full" />
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-gray-900">{venue.name}</h3>
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                            {venue.sports?.length || 0}种运动
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-4">{venue.description || '暂无描述'}</p>

                                    <div className="flex items-center text-sm text-gray-500 mb-2">
                                        <span className="mr-2">📍</span>
                                        <span>{venue.address || '地址未提供'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <span className="mr-2">📞</span>
                                        <span>{venue.phone || '电话未提供'}</span>
                                    </div>

                                    <Link
                                        to={`/venue/${venue.vid}`}
                                        className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-md transition-colors"
                                    >
                                        查看详情
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-10 text-center">
                        <Sports className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-500 mb-2">暂无推荐场馆</h3>
                        <p className="text-gray-400">当前没有可推荐的体育场所，请稍后再试</p>
                    </div>
                )}
            </div>

            {/* 热门运动类型 */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <Sports className="mr-2 text-green-600" /> 热门运动类型
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['篮球', '羽毛球', '游泳', '乒乓球'].map((sport, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                        >
                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">{sport}</h3>
                            <p className="text-sm text-gray-500 mt-1">12个场馆开放</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;