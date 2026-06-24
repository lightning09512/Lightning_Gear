import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Order } from '../../types';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { useSocket } from '../../hooks/useSocket';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrders(1);
  }, []);

  // Listen for realtime status updates
  useEffect(() => {
    if (socket) {
      socket.on('order:status_update', ({ orderId, status }) => {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
      });
    }
    return () => {
      if (socket) socket.off('order:status_update');
    };
  }, [socket]);

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders?page=${page}&limit=5`);
      if (data.success) {
        setOrders(data.data.orders);
        setPagination({
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages
        });
      }
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, className: string }> = {
      pending: { label: 'Chờ xác nhận', className: 'status-pending' },
      confirmed: { label: 'Đã xác nhận', className: 'status-confirmed' },
      shipping: { label: 'Đang giao', className: 'status-shipping' },
      delivered: { label: 'Đã giao', className: 'status-delivered' },
      cancelled: { label: 'Đã hủy', className: 'status-cancelled' },
    };
    const s = map[status];
    return <span className={`badge ${s?.className}`}>{s?.label || status}</span>;
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container py-xl">
      <h1 className="text-lg font-bold mb-lg">Lịch sử đơn hàng</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>Bạn chưa có đơn hàng nào</h3>
          <Link to="/products" className="btn btn-primary mt-lg">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-lg">
          {orders.map(order => (
            <div key={order.id} className="card p-0" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="flex justify-between items-center p-md bg-secondary border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <span className="font-bold mr-sm">Đơn hàng #{order.id}</span>
                  <span className="text-muted text-sm hide-mobile">({formatDate(order.createdAt)})</span>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="p-md">
                {order.items.map(item => {
                  const primaryImage = item.Product?.images?.[0]?.imageUrl || 'https://placehold.co/100x100';
                  return (
                    <div key={item.id} className="flex gap-md mb-md pb-md border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                      <Link to={`/products/${item.Product?.slug}`}>
                        <img src={primaryImage} alt={item.Product?.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      </Link>
                      <div className="flex-1">
                        <Link to={`/products/${item.Product?.slug}`} className="font-bold hover-text-accent block mb-xs">
                          {item.Product?.name}
                        </Link>
                        <div className="text-sm text-muted">Số lượng: {item.quantity}</div>
                      </div>
                      <div className="text-accent font-bold">
                        {formatPrice(item.priceAtOrder)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-md bg-surface border-top flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-sm">
                  <span className="text-muted">Phương thức thanh toán: </span>
                  <span className="font-bold text-uppercase">{order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
                </div>
                <div>
                  <span className="text-muted mr-sm">Tổng tiền:</span>
                  <span className="price" style={{ fontSize: '1.25rem' }}>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          ))}

          <Pagination 
            currentPage={pagination.page} 
            totalPages={pagination.totalPages} 
            onPageChange={fetchOrders} 
          />
        </div>
      )}
    </div>
  );
};

export default Orders;
