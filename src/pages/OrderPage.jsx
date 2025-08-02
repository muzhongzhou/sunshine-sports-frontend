// src/pages/OrderPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {Layout, message, Spin, Card, Table, Button, Space, Tag, Popconfirm, Typography, Empty, List} from 'antd';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const { Content } = Layout;
const { Title } = Typography;

const OrderPage = () => {
    const navigate = useNavigate();
    const { user, token, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [studentReservations, setStudentReservations] = useState([]);
    const [studentOrders, setStudentOrders] = useState([]);
    const [teacherOrders, setTeacherOrders] = useState([]);

    useEffect(() => {
        if (!authLoading && !token) {
            navigate('/login');
        }
    }, [token, authLoading, navigate]);

    // 修正：使用 useCallback 缓存数据获取函数，并指定其依赖
    const fetchStudentReservations = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/reservation/list');
            const pendingReservations = (response.data.data || []).filter(
                (reservation) => reservation.status === '待上传'
            );
            setStudentReservations(pendingReservations);
        } catch (error) {
            message.error(error.response?.data?.message || '获取预约列表失败');
        } finally {
            setLoading(false);
        }
    }, [setStudentReservations, setLoading]);

    const fetchStudentOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/order/list');
            const filteredOrders = (response.data || []).filter(
                (order) => order.user.uid === user?.uid
            );
            setStudentOrders(filteredOrders);
        } catch (error) {
            message.error(error.response?.data?.message || '获取订单列表失败');
        } finally {
            setLoading(false);
        }
    }, [user, setStudentOrders, setLoading]); // 依赖 user 对象

    const fetchTeacherOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/order/list');
            setTeacherOrders(response.data || []);
        } catch (error) {
            message.error(error.response?.data?.message || '获取订单列表失败');
        } finally {
            setLoading(false);
        }
    }, [setTeacherOrders, setLoading]);

    useEffect(() => {
        if (token && user) {
            if (user.role === 'student') {
                fetchStudentReservations();
                fetchStudentOrders();
            } else if (user.role === 'teacher') {
                fetchTeacherOrders();
            }
        }
    }, [token, user, fetchStudentReservations, fetchStudentOrders, fetchTeacherOrders]);

    const handleDeleteReservation = async (reservationId) => {
        try {
            await api.delete('/reservation/delete', {
                params: {
                    rid: reservationId,
                },
            });
            message.success('预约删除成功');
            fetchStudentReservations();
        } catch (error) {
            message.error(error.response?.data?.message || '删除失败，请稍后重试');
        }
    };

    const handleCreateOrder = async () => {
        if (studentReservations.length === 0) {
            message.warning('您没有待处理的预约可创建订单。');
            return;
        }
        try {
            await api.post('/order/create', { reservations: studentReservations.map(r => r.rid) });
            message.success('订单创建成功，等待老师审批。');
            fetchStudentReservations();
            fetchStudentOrders();
        } catch (error) {
            message.error(error.response?.data?.message || '订单创建失败，请稍后重试');
        }
    };

    const handleApproveOrder = async (orderId, status) => {
        try {
            const isApproved = status === 'approved';
            await api.post(`/order/approve`, { oid: orderId, approve: isApproved });
            message.success(`订单已${isApproved ? '审批通过' : '拒绝'}`);
            fetchTeacherOrders();
        } catch (error) {
            message.error(error.response?.data?.message || '操作失败，请稍后重试');
        }
    };

    const studentColumns = [
        { title: '场馆名称', dataIndex: ['venue', 'name'], key: 'venueName' },
        { title: '运动项目', dataIndex: ['sport', 'name'], key: 'sportName' },
        { title: '预约时段', dataIndex: 'timeSlot', key: 'timeSlot' },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Popconfirm
                        title="确定删除该预约吗？"
                        onConfirm={() => handleDeleteReservation(record.rid)}
                        okText="是"
                        cancelText="否"
                    >
                        <Button type="link" danger>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const studentOrderColumns = [
        { title: '订单ID', dataIndex: 'oid', key: 'oid' },
        {
            title: '订单详情',
            key: 'details',
            render: (_, record) => (
                <List
                    size="small"
                    dataSource={record.orderReservations || []}
                    renderItem={item => (
                        <List.Item>
                            {item.reservation.venue.name} - {item.reservation.sport.name} - {item.reservation.timeSlot}
                        </List.Item>
                    )}
                />
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === '已审批-同意' ? 'success' : (status === '已提交' ? 'processing' : 'error')}>
                    {status}
                </Tag>
            ),
        },
    ];

    const teacherColumns = [
        { title: '学生姓名', dataIndex: ['user', 'name'], key: 'userName' },
        {
            title: '订单详情',
            key: 'details',
            render: (_, record) => (
                <List
                    size="small"
                    dataSource={record.orderReservations || []}
                    renderItem={item => (
                        <List.Item>
                            {item.reservation.venue.name} - {item.reservation.sport.name} - {item.reservation.timeSlot}
                        </List.Item>
                    )}
                />
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === '已审批-同意' ? 'success' : (status === '已提交' ? 'processing' : 'error')}>
                    {status}
                </Tag>
            ),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                record.status === '已提交' && (
                    <Space>
                        <Popconfirm
                            title="确定审批通过该订单吗？"
                            onConfirm={() => handleApproveOrder(record.oid, 'approved')}
                            okText="是"
                            cancelText="否"
                        >
                            <Button type="primary">通过</Button>
                        </Popconfirm>
                        <Popconfirm
                            title="确定拒绝该订单吗？"
                            onConfirm={() => handleApproveOrder(record.oid, 'rejected')}
                            okText="是"
                            cancelText="否"
                        >
                            <Button danger>拒绝</Button>
                        </Popconfirm>
                    </Space>
                )
            ),
        },
    ];

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="加载中...">
                    <div />
                </Spin>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Layout className="min-h-screen">
            <Header />
            <Content className="p-8 bg-gray-50">
                <div className="container mx-auto">
                    <Card className="shadow-lg">
                        <Title level={2} className="text-2xl font-bold mb-4">活动订单</Title>
                        {user.role === 'student' ? (
                            <>
                                <h3 className="text-xl font-semibold mb-4">我的待处理预约</h3>
                                {studentReservations.length > 0 ? (
                                    <Table
                                        columns={studentColumns}
                                        dataSource={studentReservations}
                                        rowKey="rid"
                                        pagination={false}
                                    />
                                ) : (
                                    <Empty description="您还没有任何待处理的预约。" />
                                )}
                                <div className="mt-4 text-right">
                                    <Popconfirm
                                        title="确定将所有预约上传为订单吗？"
                                        onConfirm={handleCreateOrder}
                                        okText="是"
                                        cancelText="否"
                                    >
                                        <Button
                                            type="primary"
                                            disabled={studentReservations.length === 0}
                                        >
                                            上传全部订单
                                        </Button>
                                    </Popconfirm>
                                </div>
                                <h3 className="text-xl font-semibold mt-8 mb-4">我的订单</h3>
                                {studentOrders.length > 0 ? (
                                    <Table
                                        columns={studentOrderColumns}
                                        dataSource={studentOrders}
                                        rowKey="oid"
                                    />
                                ) : (
                                    <Empty description="您还没有任何已提交的订单。" />
                                )}
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold mb-4">所有学生订单</h3>
                                {teacherOrders && teacherOrders.length > 0 ? (
                                    <Table
                                        columns={teacherColumns}
                                        dataSource={teacherOrders}
                                        rowKey="oid"
                                    />
                                ) : (
                                    <Empty description="目前还没有任何学生订单。" />
                                )}
                            </>
                        )}
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default OrderPage;