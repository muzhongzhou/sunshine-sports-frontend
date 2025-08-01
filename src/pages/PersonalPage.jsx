// src/pages/PersonalPage.jsx
import React, { useState, useEffect } from 'react';
import { Layout, message, Spin, Card, Form, Input, Button, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const { Content } = Layout;
const { Title } = Typography;

const PersonalPage = () => {
    const navigate = useNavigate();
    const { user, token, logout, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // 在加载完成或用户信息更新时，将用户信息填充到表单
    useEffect(() => {
        if (!authLoading && !token) {
            navigate('/login');
        }
        if (user) {
            form.setFieldsValue({
                name: user.name,
                phone: user.phone,
            });
        }
    }, [user, token, authLoading, navigate, form]);

    // 处理表单提交，更新个人信息
    const handleUpdate = async (values) => {
        setLoading(true);
        try {
            await api.put('/personal/update', values); //
            message.success('个人信息更新成功！');
        } catch (error) {
            message.error(error.response?.data?.message || '更新失败，请稍后重试。');
        } finally {
            setLoading(false);
        }
    };

    // 处理退出登录
    const handleLogout = async () => {
        // useAuth 的 logout 方法已经封装了后端 API 调用和本地状态清理
        await logout();
        message.success('已成功退出登录。');
        navigate('/login');
    };

    if (authLoading || !user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    return (
        <Layout className="min-h-screen">
            <Header />
            <Content className="p-8 bg-gray-50">
                <div className="container mx-auto max-w-2xl">
                    <Card className="shadow-lg">
                        <Title level={2} className="text-center mb-6">个人信息</Title>

                        <Form
                            form={form}
                            name="personalInfo"
                            onFinish={handleUpdate}
                            layout="vertical"
                        >
                            <Form.Item
                                name="name"
                                label="姓名"
                                rules={[{ required: true, message: '请输入您的姓名!' }]}
                            >
                                <Input placeholder="姓名" />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="手机号"
                                rules={[
                                    { required: true, message: '请输入您的手机号!' },
                                    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' }
                                ]}
                            >
                                <Input placeholder="手机号" />
                            </Form.Item>

                            <Form.Item label="角色">
                                <Input value={user.role === 'teacher' ? '老师' : '学生'} disabled />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        更新信息
                                    </Button>
                                    <Button onClick={handleLogout} danger>
                                        退出登录
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default PersonalPage;