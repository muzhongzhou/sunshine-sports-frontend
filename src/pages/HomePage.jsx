// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Input, Card, message, Spin, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const { Content } = Layout;
const { Search } = Input;
const { Title } = Typography;

const HomePage = () => {
    const navigate = useNavigate();
    const { token, isLoading: authLoading } = useAuth();
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !token) {
            navigate('/login');
        }
    }, [token, authLoading, navigate]);

    // 获取场馆列表的函数
    const fetchVenues = async (keyword = '') => {
        setLoading(true);
        try {
            const url = keyword ? `/activity/search?keyword=${keyword}` : '/venue/list';
            const response = await api.get(url);
            // 修正：从 response.data.data 中获取真正的场馆数据
            setVenues(response.data.data || []);
        } catch (error) {
            message.error(error.response?.data?.message || '获取场馆列表失败');
        } finally {
            setLoading(false);
        }
    };

    // 组件挂载后立即获取所有场馆列表
    useEffect(() => {
        if (token) {
            fetchVenues();
        }
    }, [token]);

    const handleSearch = (value) => {
        fetchVenues(value);
    };

    if (authLoading || !token) {
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
                    <Title level={3} className="text-center mb-6">活动报名</Title>
                    <div className="mb-6 max-w-lg mx-auto">
                        <Search
                            placeholder="搜索场馆或运动类型"
                            allowClear
                            enterButton="搜索"
                            size="large"
                            onSearch={handleSearch}
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center mt-10">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <Row gutter={[16, 16]}>
                            {venues.length > 0 ? (
                                venues.map(venue => (
                                    // 修正：使用 venue.vid 作为 key
                                    <Col key={venue.vid} xs={24} sm={12} md={8} lg={6}>
                                        <Card
                                            hoverable
                                            title={venue.name}
                                            // 修正：导航链接使用 venue.vid
                                            onClick={() => navigate(`/venue/${venue.vid}`)}
                                            className="shadow-md"
                                        >
                                            <p className="text-gray-600 line-clamp-2">{venue.description || '暂无描述'}</p>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col span={24} className="text-center text-gray-500 mt-10">
                                    暂无场馆信息。
                                </Col>
                            )}
                        </Row>
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default HomePage;