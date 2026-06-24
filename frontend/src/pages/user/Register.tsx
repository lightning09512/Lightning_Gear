import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, phone } = formData;

    if (!username || !email || !password || !confirmPassword) {
      toast('Vui lòng điền đầy đủ các trường bắt buộc', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      toast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    if (password.length < 6) {
      toast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { username, email, password, phone });
      if (data.success) {
        toast('Đăng ký thành công! Bạn có thể đăng nhập ngay.', 'success');
        navigate('/login');
      }
    } catch (error: any) {
      toast(error.response?.data?.message || 'Đăng ký thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
           <img src="/favicon.svg" alt="NK Gear Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
           <span>NK Gear</span>
        </div>
        <h2>Tạo tài khoản mới</h2>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Họ và tên *"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Ví dụ: Nguyễn Văn A"
            required
          />
          <Input
            label="Email *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email của bạn"
            required
          />
          <Input
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Số điện thoại liên hệ"
          />
          <Input
            label="Mật khẩu *"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ít nhất 6 ký tự"
            required
          />
          <Input
            label="Xác nhận mật khẩu *"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
            required
          />

          <Button type="submit" fullWidth isLoading={loading} className="mt-md">
            Đăng ký
          </Button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
