import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, PaginatedResponse } from '../../types';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { MdCheck, MdClose, MdLock, MdLockOpen, MdSearch } from 'react-icons/md';
import Button from '../../components/Button';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async (page: number, q = search) => {
    setLoading(true);
    try {
      const url = q ? `/admin/users?page=${page}&search=${encodeURIComponent(q)}` : `/admin/users?page=${page}`;
      const { data } = await api.get<PaginatedResponse<User>>(url);
      if (data.success) {
        setUsers(data.data.users || []);
        setPagination({
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages
        });
      }
    } catch (error) {
      toast('Lỗi khi tải danh sách khách hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const toggleUserActive = async (id: number, currentStatus: boolean) => {
    const actionText = currentStatus ? 'khóa' : 'mở khóa';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản này?`)) {
      try {
        const { data } = await api.patch(`/admin/users/${id}/toggle`);
        if (data.success) {
          setUsers(users.map(u => u.id === id ? { ...u, isActive: data.data.isActive } : u));
          toast(`${data.data.isActive ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`, 'success');
        }
      } catch (error: any) {
        toast(error.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản', 'error');
      }
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1 className="text-lg font-bold">Quản lý khách hàng</h1>
      </div>

      <div className="card mb-lg p-md">
        <form onSubmit={handleSearch} className="flex gap-md">
          <input
            type="text"
            className="input flex-1"
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button type="submit" icon><MdSearch size={20} /> Tìm kiếm</Button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên người dùng</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Kích hoạt</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-lg text-muted">Không tìm thấy khách hàng nào</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td className="font-bold">{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || <span className="text-muted">-</span>}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.address || ''}>
                        {u.address || <span className="text-muted">-</span>}
                      </td>
                      <td>
                        <span className={`badge ${u.isVerified ? 'badge-success' : 'badge-danger'}`}>
                          {u.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'Đang hoạt động' : 'Đang khóa'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex justify-end gap-xs">
                          {u.isActive ? (
                            <button
                              onClick={() => toggleUserActive(u.id, u.isActive)}
                              className="btn btn-ghost btn-icon text-danger"
                              title="Khóa tài khoản"
                            >
                              <MdLock size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleUserActive(u.id, u.isActive)}
                              className="btn btn-ghost btn-icon text-success"
                              title="Mở khóa tài khoản"
                            >
                              <MdLockOpen size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-md border-top" style={{ borderColor: 'var(--border-color)' }}>
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages} 
              onPageChange={(page) => fetchUsers(page)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
