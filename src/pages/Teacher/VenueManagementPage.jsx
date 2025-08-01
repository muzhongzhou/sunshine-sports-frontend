// src/pages/Teacher/VenueManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Button, Space, Modal, Form, Input, message, Popconfirm, List, Typography, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const { Content } = Layout;
const { Title } = Typography;

const VenueManagementPage = () => {
    const { user, token, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSportModalVisible, setIsSportModalVisible] = useState(false);
    const [editingVenue, setEditingVenue] = useState(null);
    const [editingSports, setEditingSports] = useState([]);
    const [form] = Form.useForm();
    const [sportForm] = Form.useForm();

    useEffect(() => {
        if (!authLoading && (!token || user?.role !== 'teacher')) {
            navigate('/login');
        } else if (token && user?.role === 'teacher') {
            fetchVenues();
        }
    }, [token, user, authLoading, navigate]);

    // 获取所有场馆列表
    const fetchVenues = async () => {
        setLoading(true);
        try {
            const response = await api.get('/venue/list');
            setVenues(response.data.data.map(v => ({ ...v, sports: v.sports || [] })) || []);
        } catch (error) {
            message.error(error.response?.data?.message || '获取场馆列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 新增函数: 根据场馆ID获取运动项目列表
    const fetchSports = async (venueId) => {
        try {
            const response = await api.get('/sport/list', { params: { venueId } });
            setEditingSports(response.data.data || []);
        } catch {
            message.error('获取运动项目列表失败');
        }
    };

    const handleEdit = (venue = null) => {
        setEditingVenue(venue);
        form.resetFields();
        if (venue) {
            form.setFieldsValue(venue);
        }
        setIsModalVisible(true);
    };

    // 修正: 打开弹窗时，调用 fetchSports 获取该场馆的运动项目
    const handleEditSports = (venue) => {
        setEditingVenue(venue);
        setIsSportModalVisible(true);
        sportForm.resetFields();
        if (venue && venue.vid) {
            fetchSports(venue.vid);
        } else {
            setEditingSports([]); // 如果没有场馆ID，则清空运动项目列表
        }
    };

    const onFinish = async (values) => {
        try {
            if (editingVenue) {
                await api.put(`/venue/update/${editingVenue.vid}`, values);
                message.success('场馆信息更新成功');
            } else {
                await api.post('/venue/create', values);
                message.success('场馆创建成功');
            }
            setIsModalVisible(false);
            fetchVenues();
        } catch (error) {
            message.error(error.response?.data?.message || '操作失败，请稍后重试');
        }
    };

    const handleDelete = async (venueId) => {
        try {
            await api.delete(`/venue/delete/${venueId}`);
            message.success('场馆删除成功');
            fetchVenues();
        } catch (error) {
            message.error(error.response?.data?.message || '删除失败，请稍后重试');
        }
    };

    const onSportFinish = async (values) => {
        try {
            if (!editingVenue?.vid) {
                message.error('未找到场馆信息，无法添加运动项目');
                return;
            }

            const payload = {
                name: values.name,
                venueId: editingVenue.vid
            };

            await api.post('/sport/create', payload);

            message.success('运动项目添加成功');
            sportForm.resetFields();

            // 修正: 添加成功后，调用 fetchSports 刷新当前弹窗中的列表
            fetchSports(editingVenue.vid);

        } catch (error) {
            message.error(error.response?.data?.message || '添加失败，请稍后重试');
        }
    };

    const onSportFinishFailed = (errorInfo) => {
        message.warning('请检查输入项');
        console.error('Failed:', errorInfo);
    };

    const handleDeleteSport = async (sportId) => {
        try {
            await api.delete('/sport/delete', { params: { sid: sportId } });
            message.success('运动项目删除成功');
            // 修正: 删除成功后，调用 fetchSports 刷新当前弹窗中的列表
            fetchSports(editingVenue.vid);
        } catch (error) {
            message.error(error.response?.data?.message || '删除失败，请稍后重试');
        }
    };

    const columns = [
        { title: '场馆名称', dataIndex: 'name', key: 'name' },
        { title: '地址', dataIndex: 'address', key: 'address' },
        { title: '联系电话', dataIndex: 'phone', key: 'phone' },
        {
            title: '运动项目',
            key: 'sports',
            render: (_, record) => (
                <Space wrap>
                    {/* 这里不再显示运动项目，因为这个数据不存在 */}
                    <Button type="link" size="small" onClick={() => handleEditSports(record)}>
                        管理
                    </Button>
                </Space>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="primary" onClick={() => handleEdit(record)}>编辑</Button>
                    <Popconfirm
                        title="确定删除该场馆吗？"
                        onConfirm={() => handleDelete(record.vid)}
                        okText="是"
                        cancelText="否"
                    >
                        <Button danger>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (authLoading || !user || user.role !== 'teacher' || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="加载中...">
                    <div />
                </Spin>
            </div>
        );
    }

    return (
        <Layout className="min-h-screen">
            <Header />
            <Content className="p-8 bg-gray-50">
                <div className="container mx-auto">
                    <Card className="shadow-lg">
                        <Space className="mb-4" size="large">
                            <Title level={2} className="text-2xl font-bold mb-0">场馆管理</Title>
                            <Button type="primary" onClick={() => handleEdit()}>创建新场馆</Button>
                        </Space>
                        <Table
                            dataSource={venues}
                            columns={columns}
                            rowKey="vid"
                            loading={loading}
                        />
                    </Card>
                </div>
            </Content>

            {/* 场馆创建/编辑弹窗 */}
            <Modal
                title={editingVenue ? '编辑场馆' : '创建新场馆'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item name="name" label="场馆名称" rules={[{ required: true, message: '请输入场馆名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入场馆地址' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item className="text-right">
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>取消</Button>
                            <Button type="primary" htmlType="submit">
                                {editingVenue ? '更新' : '创建'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 运动项目管理弹窗 */}
            <Modal
                title={`管理 ${editingVenue?.name || ''} 的运动项目`}
                open={isSportModalVisible}
                onCancel={() => setIsSportModalVisible(false)}
                footer={null}
            >
                <Title level={4}>已有的运动项目</Title>
                <List
                    bordered
                    dataSource={editingSports}
                    renderItem={item => (
                        <List.Item
                            key={item.sid} // 修正: 使用 sid 作为 key
                            actions={[
                                <Popconfirm
                                    title="确定删除该运动项目吗？"
                                    onConfirm={() => handleDeleteSport(item.sid)} // 修正: 使用 sid
                                    okText="是"
                                    cancelText="否"
                                >
                                    <Button danger size="small">删除</Button>
                                </Popconfirm>
                            ]}
                        >
                            {item.name}
                        </List.Item>
                    )}
                />
                <Title level={4} className="mt-4">添加新的运动项目</Title>
                <Form
                    form={sportForm}
                    onFinish={onSportFinish}
                    onFinishFailed={onSportFinishFailed}
                    layout="inline"
                    className="mt-2"
                >
                    <Form.Item name="name" rules={[{ required: true, message: '请输入运动项目名称' }]}>
                        <Input placeholder="运动项目名称" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={() => sportForm.submit()}>添加</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default VenueManagementPage;