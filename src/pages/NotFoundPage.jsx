// src/pages/NotFoundPage.jsx
import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <Result
                status="404"
                title="404"
                subTitle="抱歉，您访问的页面不存在。"
                extra={
                    <Button type="primary" onClick={() => navigate('/home')}>
                        返回主页
                    </Button>
                }
            />
        </div>
    );
};

export default NotFoundPage;