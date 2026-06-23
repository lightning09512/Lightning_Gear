import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import Input from '../../components/Input';
import Button from '../../components/Button';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: user?.username || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwdData({ ...pwdData, [e.target.name]: e.target.value });
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/user/profile', formData);
      if (data.success) {
        updateUser(data.data);
        toast('Cập nhật thông tin thành công', 'success');
      }
    } catch (error: any) {
      toast(error.response?.data?.message || 'Cập nhật thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      toast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    setPwdLoading(true);
    try {
      const { data } = await api.put('/user/change-password', {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword,
      });
      if (data.success) {
        toast('Đổi mật khẩu thành công', 'success');
        setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error: any) {
      toast(error.response?.data?.message || 'Đổi mật khẩu thất bại', 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-xl">
      <h1 className="text-lg font-bold mb-lg">Hồ sơ cá nhân</h1>
      
      <div className="grid grid-2">
        {/* Profile Info Form */}
        <div className="card">
          <h3 className="filter-title border-bottom pb-sm mb-md">Thông tin cá nhân</h3>
          <form onSubmit={updateProfile} className="flex flex-col gap-md">
            <Input
              label="Email (Không thể thay đổi)"
              value={user.email}
              disabled
            />
            <Input
              label="Họ và tên"
              name="username"
              value={formData.username}
              onChange={handleProfileChange}
              required
            />
            <Input
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleProfileChange}
            />
            <Input
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={handleProfileChange}
            />
            <Button type="submit" isLoading={loading} className="mt-sm self-start">
              Lưu thay đổi
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <h3 className="filter-title border-bottom pb-sm mb-md">Đổi mật khẩu</h3>
          <form onSubmit={updatePassword} className="flex flex-col gap-md">
            <Input
              type="password"
              label="Mật khẩu hiện tại"
              name="currentPassword"
              value={pwdData.currentPassword}
              onChange={handlePwdChange}
              required
            />
            <Input
              type="password"
              label="Mật khẩu mới"
              name="newPassword"
              value={pwdData.newPassword}
              onChange={handlePwdChange}
              required
            />
            <Input
              type="password"
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              value={pwdData.confirmPassword}
              onChange={handlePwdChange}
              required
            />
            <Button type="submit" variant="secondary" isLoading={pwdLoading} className="mt-sm self-start">
              Đổi mật khẩu
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
