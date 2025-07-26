import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
    ArrowBack,
    Star,
    Place,
    Phone,
    Sports,
    Comment,
    StarHalf
} from '@mui/icons-material';

function VenueDetail() {
    const { id } = useParams();
    const [venue, setVenue] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [selectedSport, setSelectedSport] = useState('');
    const [timeSlot, setTimeSlot] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchVenueDetail();
        fetchComments();
    }, []);

    const fetchVenueDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:7001/activity/detail?venueId=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setVenue(data.data.venue);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('获取场馆详情失败');
        }
    };

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:7001/comment/list?venueId=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setComments(data.data);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('获取评论失败');
        }
    };

    const handleAddComment = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = JSON.parse(localStorage.getItem('user')).uid; // 假设 user 存在 localStorage
            const response = await fetch('http://localhost:7001/comment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    venueId: id,
                    userId,
                    content: newComment
                })
            });
            const data = await response.json();
            if (data.success) {
                setNewComment('');
                fetchComments();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('添加评论失败');
        }
    };

    const handleReserve = async () => {
        if (!selectedSport || !timeSlot) {
            alert('请选择运动并填写时间段');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:7001/reservation/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    venueId: id,
                    sportId: selectedSport,
                    timeSlot
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('报名成功');
                setSelectedSport('');
                setTimeSlot('');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('报名失败');
        }
    };

    if (!venue) return <div className="p-6">加载中...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowBack className="mr-1" /> 返回
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-64 bg-gray-200 border-2 border-dashed rounded-xl w-full" />

                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
                        <div className="flex items-center">
                            <Star className="text-yellow-400" />
                            <span className="ml-1 text-gray-700">4.8 (120评价)</span>
                        </div>
                    </div>

                    <p className="mt-2 text-gray-600">{venue.description}</p>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <Place className="text-gray-400 mr-2" />
                            <span>{venue.address}</span>
                        </div>
                        <div className="flex items-center">
                            <Phone className="text-gray-400 mr-2" />
                            <span>{venue.phone}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <Sports className="mr-2" /> 可报名运动
                        </h2>

                        <div className="space-y-4">
                            {venue.sports.map((sport) => (
                                <div key={sport.sid} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">{sport.name}</h3>
                                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  可预约
                </span>
                                    </div>

                                    <div className="mt-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">选择时间段：</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {['12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'].map((time) => (
                                                <button
                                                    key={time}
                                                    className="py-2 px-3 bg-gray-100 hover:bg-green-100 border border-gray-200 rounded-md text-sm transition-colors"
                                                    onClick={() => {
                                                        setSelectedSport(sport.sid);
                                                        setTimeSlot(time);
                                                    }}>
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedSport === sport.sid && timeSlot && (
                                        <button
                                            onClick={handleReserve}
                                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors">
                                            立即报名
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <Comment className="mr-2" /> 用户评价
                        </h2>

                        <div className="space-y-4">
                            {comments.length > 0 ? comments.map(comment => (
                                <div key={comment.cid} className="border-b pb-4 last:border-0">
                                    <div className="flex items-center mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-dashed" />
                                        <div className="ml-3">
                                            <div className="font-medium">匿名用户</div>
                                            <div className="flex text-yellow-400">
                                                <Star /><Star /><Star /><Star /><StarHalf />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700">{comment.content}</p>
                                    <div className="text-xs text-gray-500 mt-2">2023-06-15</div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center py-4">暂无评价</p>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                        <h2 className="text-xl font-bold mb-4">发表评价</h2>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="分享您的体验..."
                            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex text-2xl text-yellow-400">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} className="cursor-pointer hover:text-yellow-500" />
                                ))}
                            </div>
                            <button
                                onClick={handleAddComment}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
                                提交评价
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VenueDetail;
