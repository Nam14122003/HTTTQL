import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gửi yêu cầu đến API để gửi email
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage('Email khôi phục mật khẩu đã được gửi!');
            } else {
                setMessage(data.error || 'Đã xảy ra lỗi.');
            }
        } catch (error) {
            setMessage('Không thể kết nối đến máy chủ.');
        }
    };

    return (
        <div>
            <h2>Quên mật khẩu</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Nhập email của bạn:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Gửi</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ForgotPassword; 