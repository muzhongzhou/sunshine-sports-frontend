// src/components/Layout/Header.jsx
import React from 'react';
import { Layout, Menu, Button, Space, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header: AntdHeader } = Layout;
const { Text } = Typography;

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth(); // 获取用户信息和退出登录方法

    const handleMenuClick = ({ key }) => {
        if (key === 'logout') {
            logout();
            navigate('/login');
            return;
        }
        navigate(key);
    };

    const getMenuItems = () => {
        if (!user) {
            return [];
        }

        let menuItems = [
            { key: '/home', label: '活动报名' },
            { key: '/orders', label: '活动订单' },
            { key: '/personal', label: '个人信息' },
        ];

        if (user.role === 'teacher') {
            // 这里可以为老师添加额外的管理后台等功能
            menuItems.push({ key: '/teacher/venues', label: '场馆管理' });
        }

        return menuItems;
    };

    const currentPath = location.pathname;

    const getRoleName = (role) => {
        if (role === 'student') return '学生';
        if (role === 'teacher') return '老师';
        return role;
    };

    return (
        <AntdHeader className="bg-white flex items-center justify-between px-6 shadow-md">
            <div className="flex items-center">
                <Text className="text-xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/home')}>
                    阳光体育中心
                </Text>
            </div>

            {user && (
                <div className="flex-1 ml-10">
                    <Menu
                        theme="light"
                        mode="horizontal"
                        selectedKeys={[currentPath]}
                        items={getMenuItems()}
                        onClick={handleMenuClick}
                        className="border-b-0"
                    />
                </div>
            )}

            <div className="flex items-center">
                {user ? (
                    <Space size="middle">
                        {/* 在这里添加了安全检查 user?.name 和 user?.role */}
                        <Text className="text-gray-600">欢迎，{user?.name} ({getRoleName(user?.role)})</Text>
                        <Button type="text" onClick={() => handleMenuClick({ key: 'logout' })}>退出登录</Button>
                    </Space>
                ) : (
                    <Space size="middle">
                        <Button type="text" onClick={() => navigate('/login')}>登录</Button>
                        <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
                    </Space>
                )}
            </div>
        </AntdHeader>
    );
};

export default Header;