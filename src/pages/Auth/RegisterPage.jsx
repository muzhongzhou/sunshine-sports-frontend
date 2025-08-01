// src/pages/Auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { UserOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // 调用后端注册接口
            await api.post('/user/register', {
                name: values.name,
                phone: values.phone,
                password: values.password,
                role: values.role,
            });

            message.success('注册成功！请前往登录页面。');

            // 注册成功后跳转到登录页
            navigate('/login');
        } catch (error) {
            console.error('注册失败:', error);
            const errorMessage = error.response?.data?.message || '注册失败，请稍后重试。';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-md shadow-lg">
                <h2 className="text-center text-2xl font-bold mb-6">阳光体育中心注册</h2>
                <Form
                    form={form}
                    name="register"
                    onFinish={onFinish}
                    scrollToFirstError
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: '请输入您的姓名!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="姓名" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        rules={[
                            { required: true, message: '请输入您的手机号!' },
                            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' }
                        ]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="手机号" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: '请输入您的密码!' },
                            { min: 6, message: '密码至少为6位!' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: '请再次输入您的密码!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次输入的密码不匹配!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        rules={[{ required: true, message: '请选择您的身份!' }]}
                    >
                        <Select placeholder="选择身份">
                            <Option value="student">学生</Option>
                            <Option value="teacher">老师</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            注册
                        </Button>
                    </Form.Item>
                    <div className="text-center">
                        已有账号？ <a className="text-blue-500 hover:underline" onClick={() => navigate('/login')}>前往登录</a>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;