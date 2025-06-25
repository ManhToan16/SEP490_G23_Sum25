// File: LoginModal.jsx
import React, { useState } from 'react';
import './LoginModal.scss';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginModal = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Đăng nhập với: ${username} / ${password}`);
    onClose(); // hoặc xử lý khác
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Đăng Nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Tên đăng nhập *</label>
            <div className="input-icon">
              <FaUser />
              <input
                type="text"
                id="username"
                placeholder="Vui lòng nhập email của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Mật khẩu *</label>
            <div className="input-icon">
              <FaLock />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Vui lòng nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="toggle-password" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="submit-btn">Đăng Nhập</button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
