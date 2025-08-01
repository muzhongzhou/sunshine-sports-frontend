// src/pages/VenueDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, message, Spin, Card, Tabs, Radio, Button, List, Form, Input, Typography } from 'antd';
import { Comment } from '@ant-design/compatible';
import { UserOutlined } from '@ant-design/icons';
import Header from '../components/Layout/Header';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

// 评论提交表单组件
const CommentForm = ({ onSubmit, submitting }) => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        form.resetFields();
        onSubmit(values.content);
    };

    return (
        <Form form={form} onFinish={onFinish}>
            <Form.Item name="content" rules={[{ required: true, message: '请输入评论内容!' }]}>
                <TextArea rows={4} placeholder="在这里发表你的评论..." />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" loading={submitting} type="primary">
                    发表评论
                </Button>
            </Form.Item>
        </Form>
    );
};

const VenueDetailPage = () => {
    const { vid } = useParams(); // 获取场馆ID
    const navigate = useNavigate();
    const { user, token, isLoading: authLoading } = useAuth();
    const [venueDetails, setVenueDetails] = useState(null);
    const [sports, setSports] = useState([]); // 新增状态：存储运动项目列表
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const timeSlots = ['12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];

    useEffect(() => {
        if (!authLoading && !token) {
            navigate('/login');
        }
    }, [token, authLoading, navigate]);

    // 修正: 分步获取场馆详情和运动项目
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                // 1. 获取场馆详情
                const venueResponse = await api.get(`/venue/${vid}`);
                // 修正: 接口返回的场馆详情在 data 字段中
                setVenueDetails(venueResponse.data.data);

                // 2. 根据场馆ID，获取运动项目列表
                const sportsResponse = await api.get('/sport/list', { params: { venueId: vid } });
                // 修正: 接口返回的运动项目在 data 字段中
                setSports(sportsResponse.data.data);

                // 3. 获取评论列表
                const commentsResponse = await api.get(`/comment/list?venueId=${vid}`);
                // 修正: 接口返回的评论在 data 字段中
                setComments(commentsResponse.data.data);
            } catch (error) {
                message.error(error.response?.data?.message || '获取详情失败，请检查网络');
                navigate('/home'); // 失败则返回主页
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDetails();
        }
    }, [vid, token, navigate]);

    // 处理预约报名
    const handleBook = async (sportId, timeSlot) => {
        if (user.role !== 'student') {
            message.warning('只有学生可以进行预约报名。');
            return;
        }

        setBookingLoading(true);
        try {
            await api.post('/reservation/create', {
                venueId: vid,
                sportId: sportId,
                timeSlot: timeSlot,
            });
            message.success('报名成功，可在活动订单中查看！');
        } catch (error) {
            message.error(error.response?.data?.message || '报名失败，请稍后重试。');
        } finally {
            setBookingLoading(false);
        }
    };

    // 处理评论提交
    const handleCommentSubmit = async (content) => {
        if (!user) {
            message.warning('请登录后发表评论。');
            return;
        }

        setCommentSubmitting(true);
        try {
            const newComment = await api.post('/comment/create', {
                venueId: vid,
                content: content,
            });
            // 成功后，更新评论列表
            setComments([...comments, newComment.data]);
            message.success('评论发表成功！');
        } catch (error) {
            message.error(error.response?.data?.message || '评论失败，请稍后重试。');
        } finally {
            setCommentSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (!venueDetails) {
        return <div className="p-8 text-center text-gray-500">未找到该场馆信息。</div>;
    }

    // 修正: 遍历 sports 状态来生成 Tabs
    const sportItems = sports.map(sport => ({
        key: sport.sid.toString(), // 修正: 使用 sid 作为 key
        label: sport.name,
        children: (
            <div className="p-4 bg-white rounded-lg shadow-inner">
                <Radio.Group className="flex flex-wrap gap-4">
                    {timeSlots.map(slot => (
                        <Radio.Button
                            key={slot}
                            value={slot}
                            className="w-full sm:w-auto text-center"
                            onClick={() => handleBook(sport.sid, slot)} // 修正: 使用 sid
                            disabled={user?.role !== 'student' || bookingLoading}
                        >
                            {slot}
                        </Radio.Button>
                    ))}
                </Radio.Group>
                {user?.role !== 'student' && (
                    <Paragraph className="mt-4 text-red-500">
                        <small>只有学生角色可以进行预约。</small>
                    </Paragraph>
                )}
            </div>
        ),
    }));

    return (
        <Layout className="min-h-screen">
            <Header />
            <Content className="p-8 bg-gray-50">
                <div className="container mx-auto max-w-4xl">
                    <Card className="shadow-lg mb-8">
                        <Title level={2}>{venueDetails.name}</Title>
                        <Paragraph>{venueDetails.description}</Paragraph>
                    </Card>

                    <Card title="活动预约" className="shadow-lg mb-8">
                        {/* 修正: 检查 sports 列表是否为空 */}
                        {sports.length > 0 ? (
                            <Tabs defaultActiveKey={sports[0]?.sid.toString()} items={sportItems} />
                        ) : (
                            <Paragraph className="text-gray-500">该场馆暂无运动项目。</Paragraph>
                        )}
                    </Card>

                    <Card title="评论区" className="shadow-lg">
                        <CommentForm onSubmit={handleCommentSubmit} submitting={commentSubmitting} />
                        <List
                            className="comment-list mt-4"
                            header={`${comments.length} 条评论`}
                            itemLayout="horizontal"
                            dataSource={comments}
                            renderItem={item => (
                                <Comment
                                    author={item.user.name}
                                    avatar={<UserOutlined />}
                                    content={<p>{item.content}</p>}
                                    datetime={item.createdAt}
                                />
                            )}
                        />
                    </Card>
                </div>
            </Content>
        </Layout>
    );
};

export default VenueDetailPage;