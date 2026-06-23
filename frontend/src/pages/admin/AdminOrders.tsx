import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Order, PaginatedResponse } from '../../types';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useSocket } from '../../hooks/useSocket';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const { toast } = useToast();
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Realtime updates for new orders
  useEffect(() => {
    if (socket) {
      socket.on('admin:new_order', (newOrder) => {
        toast(`Đơn hàng mới #${newOrder.id} vừa được đặt!`, 'info');
        if (pagination.page === 1 && !statusFilter) {
          fetchOrders(1); // Refresh if on first page and no filter
        }
      });
    }
    return () => {
      if (socket) socket.off('admin:new_order');
    };
  }, [socket, pagination.page, statusFilter, toast]);

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      let url = `/admin/orders?page=${page}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      
      const { data } = await api.get<PaginatedResponse<Order>>(url);
      if (data.success) {
        setOrders(data.data.orders || []);
        setPagination({
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages
        });
      }
    } catch (error) {
      toast('Lỗi khi tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const { data } = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        toast('Cập nhật trạng thái thành công', 'success');
      }
    } catch (error: any) {
      toast(error.response?.data?.message || 'Cập nhật thất bại', 'error');
    }
  };

  const getStatusOptions = () => [
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipping', label: 'Đang giao hàng' },
    { value: 'delivered', label: 'Đã giao thành công' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'var(--accent-yellow)';
      case 'confirmed': return 'var(--accent-primary)';
      case 'shipping': return 'var(--accent-secondary)';
      case 'delivered': return 'var(--accent-green)';
      case 'cancelled': return 'var(--accent-red)';
      default: return 'inherit';
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1 className="text-lg font-bold">Quản lý đơn hàng</h1>
      </div>

      <div className="card mb-lg p-md flex gap-md">
        <select 
          className="input flex-1" 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {getStatusOptions().map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-lg text-muted">Không có đơn hàng nào</td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td className="font-bold">#{order.id}</td>
                      <td>
                        <div className="font-bold">{order.User?.username}</div>
                        <div className="text-xs text-muted">{order.User?.phone}</div>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="font-bold text-accent">{formatPrice(order.totalAmount)}</td>
                      <td className="text-uppercase">{order.paymentMethod === 'cod' ? 'COD' : 'Bank'}</td>
                      <td>
                        <span 
                          className="badge" 
                          style={{ 
                            background: `${getStatusColor(order.status)}20`, 
                            color: getStatusColor(order.status) 
                          }}
                        >
                          {getStatusOptions().find(o => o.value === order.status)?.label || order.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="input" 
                          style={{ padding: '6px 10px', height: 'auto', fontSize: '0.8rem', minWidth: 150 }}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={order.status === 'delivered' || order.status === 'cancelled'}
                        >
                          {getStatusOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
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
              onPageChange={(page) => fetchOrders(page)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
