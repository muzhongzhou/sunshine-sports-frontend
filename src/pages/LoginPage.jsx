import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../api/user.js';

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ phone: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    const handleSubmit = async () => {
        setError('');
        if (!form.phone || !form.password) {
            setError('请填写所有字段');
            return;
        }
        try {
            const res = await loginAPI(form);
            if (res.data.success) {
                localStorage.setItem('token', res.data.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.data.user));
                navigate('/');
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            console.error(err);
            setError('注册失败，请检查网络');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded shadow-md w-80">
                <h1 className="text-2xl font-bold mb-4 text-center">登录</h1>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <input
                    name="phone"
                    placeholder="手机号"
                    value={form.phone}
                    onChange={handleChange}
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="密码"
                    value={form.password}
                    onChange={handleChange}
                    className="border p-2 mb-4 w-full"
                />
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white p-2 rounded w-full"
                >
                    登录
                </button>
                <p className="mt-2 text-sm text-center">
                    没有账号？ <span className="text-blue-500 cursor-pointer" onClick={() => navigate('/register')}>去注册</span>
                </p>
            </div>
        </div>
    );
}
