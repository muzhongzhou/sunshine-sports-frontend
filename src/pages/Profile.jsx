import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const [form, setForm] = useState({
        name: user.name || "",
        phone: user.phone || "",
        identity: user.identity || "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleUpdate = async () => {
        try {
            const res = await axios.put(
                'http://localhost:7001/personal/update',
                form,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (res.data.success) {
                setMessage("更新成功！");
                // 更新 localStorage 中的 user 信息
                const updatedUser = {...user, ...form};
                localStorage.setItem("user", JSON.stringify(updatedUser));
            } else {
                setMessage(res.data.message || "更新失败");
            }
        } catch (err) {
            console.error(err);
            setMessage("请求失败，请检查网络。");
        }
    };

    const handleLogout = async () => {
        try {
            const res = await axios.post(
                'http://localhost:7001/personal/logout',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (res.data.success) {
                // 清空 token 和 user
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            } else {
                setMessage(res.data.message || "登出失败");
            }
        } catch (err) {
            console.error(err);
            setMessage("请求失败，请检查网络。");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
            <h1 className="text-2xl font-bold mb-4">个人信息</h1>

            <div className="mb-4">
                <label className="block mb-1">姓名</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                />
            </div>

            <div className="mb-4">
                <label className="block mb-1">电话</label>
                <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                />
            </div>

            <div className="mb-4">
                <label className="block mb-1">身份</label>
                <input
                    type="text"
                    name="identity"
                    value={form.identity}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                />
            </div>

            <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
                更新信息
            </button>

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
            >
                退出登录
            </button>

            {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
    );
}

export default Profile;
