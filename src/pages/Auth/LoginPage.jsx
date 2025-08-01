// src/pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // 使用我们的自定义 Hook
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await api.post('/user/login', {
                phone: values.phone,
                password: values.password,
            });

            const { token } = response.data.data; // 确保解构路径正确

            // 登录成功，调用 AuthContext 的 login 方法
            login(token);
            message.success('登录成功！');

            // 登录成功后跳转到主页
            navigate('/home');
        } catch (error) {
            const errorMessage = error.response?.data?.message || '登录失败，请检查手机号或密码。';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md shadow-lg">
                <h2 className="text-center text-2xl font-bold mb-6">阳光体育中心登录</h2>
                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    className="space-y-4"
                >
                    <Form.Item
                        name="phone"
                        rules={[
                            { required: true, message: '请输入您的手机号!' },
                            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' }
                        ]}
                    >
                        <Input
                            prefix={<PhoneOutlined className="site-form-item-icon" />}
                            placeholder="手机号"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入您的密码!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="密码"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            登录
                        </Button>
                    </Form.Item>
                    <div className="text-center">
                        还没有账号？ <a className="text-blue-500 hover:underline" onClick={() => navigate('/register')}>立即注册</a>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;