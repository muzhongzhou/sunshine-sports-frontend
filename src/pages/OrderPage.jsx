import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import {
    Receipt,
    Delete,
    ShoppingCart,
    CheckCircle
} from '@mui/icons-material';

function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [activeTab, setActiveTab] = useState('reservations');
    const user = JSON.parse(localStorage.getItem('user'));
    const [isSubmitting, setIsSubmitting] = useState(false);


    // 获取用户预订数据
    useEffect(() => {
        if (user?.role === '学生') {
            axios.get('/reservation/list')
                .then(res => {
                    if (res.data.success) {
                        setReservations(res.data.data);
                    }
                });
        }
    }, [user]);

    // 获取订单数据（学生和管理员）
    useEffect(() => {
        if (user) {
            axios.get('/order/list')
                .then(res => {
                    if (res.data.success) {
                        setOrders(res.data.data);
                    }
                });
        }
    }, [user]);


    // 删除预订
    const handleDeleteReservation = (rid) => {
        axios.delete(`/reservation/delete?rid=${rid}`)
            .then(res => {
                if (res.data.success) {
                    setReservations(reservations.filter(r => r.rid !== rid));
                }
            });
    };

    // 提交订单
    const handleSubmitOrder = () => {
        setIsSubmitting(true);
        axios.post('/order/create', { uid: user.uid })
            .then(res => {
                if (res.data.success) {
                    setReservations([]);
                    axios.get('/order/list').then(res => {
                        if (res.data.success) setOrders(res.data.data);
                    });
                }
            })
            .finally(() => setIsSubmitting(false));
    };


    // 审批订单
    const handleApproveOrder = (oid, approve) => {
        axios.post('/order/approve', { oid, approve })
            .then(res => {
                if (res.data.success) {
                    setOrders(orders.map(order =>
                        order.oid === oid ? { ...order, status: approve ? '已通过' : '已拒绝' } : order
                    ));
                }
            });
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Receipt className="mr-2" /> 订单管理
                </h1>
            </div>

            {user?.role === '学生' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                    <div className="border-b border-gray-200">
                        <button
                            className={`px-6 py-4 font-medium ${activeTab === 'reservations' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('reservations')}>
                            我的预订
                        </button>
                        <button
                            className={`px-6 py-4 font-medium ${activeTab === 'orders' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('orders')}>
                            历史订单
                        </button>
                    </div>

                    {activeTab === 'reservations' ? (
                        <div className="p-6">
                            {reservations.length > 0 ? (
                                <>
                                    <div className="space-y-4">
                                        {reservations.map(res => (
                                            <div key={res.rid} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <div className="font-semibold">{res.venueName} - {res.sportName}</div>
                                                    <div className="text-sm text-gray-500 mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                              {res.timeSlot}
                            </span>
                                                        <span>预订时间: {new Date(res.createTime).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteReservation(res.rid)}
                                                    className="text-red-600 hover:text-red-800">
                                                    <Delete />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={isSubmitting}
                                        className={`mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {isSubmitting ? '提交中...' : '提交订单'}
                                    </button>

                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <ShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                                    <p className="text-xl text-gray-500">暂无预订</p>
                                    <p className="text-gray-400 mt-2">快去活动页面选择您喜欢的运动吧</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6">
                            {orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order.oid} className="p-4 border rounded-md shadow-sm bg-gray-50">
                                            <div className="font-bold text-gray-800 mb-2">订单号 #{order.oid}</div>
                                            <div className="text-sm text-gray-600 mb-1">提交时间：{new Date(order.createTime).toLocaleString()}</div>
                                            <div className="text-sm text-gray-600 mb-1">状态：{order.status}</div>
                                            <div className="text-sm text-gray-600">
                                                {order.reservations.map(res => (
                                                    <div key={res.rid}>
                                                        {res.venueName} · {res.sportName} ({res.timeSlot})
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">总金额：¥{order.amount}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400">暂无历史订单</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {user?.role === '老师' && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">待审批订单</h2>
                        {orders.filter(o => o.status === '待审批').length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单号</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学生</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预订内容</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.filter(o => o.status === '待审批').map(order => (
                                        <tr key={order.oid}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.oid}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-dashed mr-3" />
                                                    <div>
                                                        <div className="font-medium">{order.userName}</div>
                                                        <div className="text-gray-400">{order.userPhone}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {order.reservations.map(res => (
                                                    <div key={res.rid} className="mb-1">
                                                        {res.venueName} · {res.sportName} ({res.timeSlot})
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{order.amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleApproveOrder(order.oid, true)}
                                                        className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                                                        通过
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveOrder(order.oid, false)}
                                                        className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
                                                        拒绝
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <CheckCircle className="text-6xl text-green-300 mx-auto mb-4" />
                                <p className="text-xl text-gray-500">暂无待审批订单</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderPage;