import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAPI } from '../api/user';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: '学生',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.name || !form.phone || !form.password || !form.confirmPassword) {
            setError('请填写所有字段');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }
        try {
            const res = await registerAPI({
                name: form.name,
                phone: form.phone,
                password: form.password,
                role: form.role,
            });
            if (res.data.success) {
                alert('注册成功，请登录');
                navigate('/login');
            } else {
                setError(res.data.message);
            }
        } catch {
            setError('注册失败，请检查网络');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded shadow-md w-80">
                <h1 className="text-2xl font-bold mb-4 text-center">注册</h1>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <input
                    name="name"
                    placeholder="姓名"
                    value={form.name}
                    onChange={handleChange}
                    className="border p-2 mb-2 w-full"
                />
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
                    className="border p-2 mb-2 w-full"
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="确认密码"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="border p-2 mb-2 w-full"
                />
                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="border p-2 mb-4 w-full"
                >
                    <option value="学生">学生</option>
                    <option value="老师">老师</option>
                </select>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white p-2 rounded w-full"
                >
                    注册
                </button>
                <p className="mt-2 text-sm text-center">
                    已有账号？
                    <span
                        className="text-blue-500 cursor-pointer"
                        onClick={() => navigate('/login')}
                    >
            去登录
          </span>
                </p>
            </div>
        </div>
    );
}
