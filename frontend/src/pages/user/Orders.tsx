import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Order } from '../../types';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { useSocket } from '../../hooks/useSocket';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const { socket } = useSocket();
  const { toast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getPaymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      cod: 'COD',
      bank_transfer: 'Chuyển khoản',
      momo: 'MoMo',
      zalopay: 'ZaloPay',
      vnpay: 'VNPay',
      credit_card: 'Thẻ tín dụng',
      installment: 'Trả góp',
    };
    return map[method] || method;
  };

  const getPaymentDetails = (method: string) => {
    const map: Record<string, { title: string, color: string, instructions: string, icon: string }> = {
      bank_transfer: {
        title: 'Chuyển khoản Ngân hàng (VietQR)',
        color: '#2c3e50',
        instructions: 'Mở ứng dụng Ngân hàng (Mobile Banking) của bạn, quét mã QR bên dưới để chuyển khoản nhanh 24/7.',
        icon: '🏦'
      },
      momo: {
        title: 'Thanh toán qua Ví MoMo',
        color: '#d82d8b',
        instructions: 'Mở ứng dụng Ví MoMo, chọn chức năng "Quét Mã" và quét mã QR bên dưới để thực hiện thanh toán chuyển tiền nhanh.',
        icon: '🌸'
      },
      zalopay: {
        title: 'Thanh toán qua Ví ZaloPay',
        color: '#008fe5',
        instructions: 'Mở ứng dụng ZaloPay, chọn chức năng "Quét Mã" và quét mã QR bên dưới để thanh toán đơn hàng.',
        icon: '📱'
      },
      vnpay: {
        title: 'Thanh toán qua Cổng VNPay-QR',
        color: '#005aab',
        instructions: 'Mở ứng dụng Ngân hàng hoặc ví VNPay, chọn chức năng "Quét Mã QR" để quét mã bên dưới.',
        icon: '💳'
      },
      credit_card: {
        title: 'Cổng Thẻ Tín Dụng Quốc Tế',
        color: '#6c5ce7',
        instructions: 'Quét mã QR thanh toán bằng ứng dụng ngân hàng hoặc ví điện tử hỗ trợ để thanh toán.',
        icon: '🌐'
      },
      installment: {
        title: 'Trả góp 0% qua Thẻ tín dụng',
        color: '#00b894',
        instructions: 'Quét mã QR liên kết trả góp bằng ứng dụng ngân hàng hoặc ứng dụng ví điện tử hỗ trợ.',
        icon: '📈'
      }
    };
    return map[method] || map.bank_transfer;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast(`Đã sao chép ${label}!`, 'success');
  };

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
                <div className="text-sm flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                  <div>
                    <span className="text-muted">Phương thức thanh toán: </span>
                    <span className="font-bold text-uppercase">{getPaymentMethodLabel(order.paymentMethod)}</span>
                  </div>
                  {order.status === 'pending' && order.paymentMethod !== 'cod' && (
                    <button 
                      className="btn btn-primary btn-sm flex items-center gap-xs"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowPaymentModal(true);
                      }}
                      style={{ padding: '4px 10px', fontSize: '0.8rem', minHeight: 'auto' }}
                    >
                      💳 Thanh toán QR
                    </button>
                  )}
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

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedOrder(null);
        }}
        title="Thanh toán đơn hàng"
        footer={
          <div className="flex gap-sm justify-end w-full" style={{ width: '100%' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedOrder(null);
              }}
            >
              Đóng
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                toast('Yêu cầu thanh toán của bạn đang được hệ thống xác nhận!', 'success');
                setShowPaymentModal(false);
                setSelectedOrder(null);
              }}
            >
              Tôi đã chuyển khoản
            </button>
          </div>
        }
      >
        {selectedOrder && (() => {
          const paymentInfo = getPaymentDetails(selectedOrder.paymentMethod);
          return (
            <div className="text-center p-sm">
              
              {/* Branded Payment Type Badge */}
              <div 
                className="p-sm text-white font-bold border-radius-md mb-md text-center"
                style={{ 
                  background: paymentInfo.color,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto 1rem auto'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{paymentInfo.icon}</span>
                <span>{paymentInfo.title}</span>
              </div>

              <p className="text-sm text-muted mb-md">
                Đơn hàng <strong>#{selectedOrder.id}</strong> đang chờ thanh toán. {paymentInfo.instructions}
              </p>

              {/* QR Code Container */}
              <div 
                className="flex flex-col items-center justify-center p-md mb-md border-radius-lg"
                style={{ 
                  background: 'var(--bg-secondary, #f8f9fa)', 
                  border: '1px solid var(--border-color)',
                  maxWidth: '320px',
                  margin: '0 auto 1.5rem auto'
                }}
              >
                <img 
                  src={`https://img.vietqr.io/image/MB-0986552233-compact.png?amount=${selectedOrder.totalAmount}&addInfo=LG${selectedOrder.id}&accountName=LIGHTNING%20GEAR`}
                  alt={`Mã QR thanh toán ${paymentInfo.title}`}
                  style={{ width: '240px', height: '240px', objectFit: 'contain', borderRadius: '8px' }}
                />
                <span className="text-xs text-muted mt-sm" style={{ marginTop: '8px', display: 'block' }}>
                  Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để tự động nhập thông tin
                </span>
              </div>

              {/* Payment Details */}
              <div 
                className="text-left text-sm p-md border-radius-md flex flex-col gap-xs mb-md"
                style={{ 
                  background: 'var(--bg-primary, #ffffff)', 
                  border: '1px dashed var(--accent-primary)', 
                  fontSize: '0.9rem',
                  padding: '12px',
                  borderRadius: '8px'
                }}
              >
                <div className="flex justify-between items-center py-xs border-bottom" style={{ borderColor: 'var(--border-color)', paddingBottom: '6px', paddingTop: '6px' }}>
                  <span className="text-muted">Ngân hàng thụ hưởng:</span>
                  <span className="font-bold">MB Bank (Ngân hàng Quân Đội)</span>
                </div>
                <div className="flex justify-between items-center py-xs border-bottom" style={{ borderColor: 'var(--border-color)', paddingBottom: '6px', paddingTop: '6px' }}>
                  <span className="text-muted">Số tài khoản:</span>
                  <div className="flex items-center gap-xs">
                    <span className="font-bold font-mono">0986552233</span>
                    <button 
                      type="button"
                      className="btn btn-ghost btn-xs text-accent" 
                      onClick={() => copyToClipboard('0986552233', 'số tài khoản')}
                      style={{ padding: '2px 6px', fontSize: '0.75rem', minHeight: 'auto', border: '1px solid var(--accent-primary)', borderRadius: '4px', background: 'transparent' }}
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-xs border-bottom" style={{ borderColor: 'var(--border-color)', paddingBottom: '6px', paddingTop: '6px' }}>
                  <span className="text-muted">Chủ tài khoản:</span>
                  <span className="font-bold">LIGHTNING GEAR</span>
                </div>
                <div className="flex justify-between items-center py-xs border-bottom" style={{ borderColor: 'var(--border-color)', paddingBottom: '6px', paddingTop: '6px' }}>
                  <span className="text-muted">Số tiền:</span>
                  <div className="flex items-center gap-xs">
                    <span className="font-bold text-accent">{formatPrice(selectedOrder.totalAmount)}</span>
                    <button 
                      type="button"
                      className="btn btn-ghost btn-xs text-accent" 
                      onClick={() => copyToClipboard(String(selectedOrder.totalAmount), 'số tiền')}
                      style={{ padding: '2px 6px', fontSize: '0.75rem', minHeight: 'auto', border: '1px solid var(--accent-primary)', borderRadius: '4px', background: 'transparent' }}
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-xs" style={{ paddingTop: '6px' }}>
                  <span className="text-muted">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-xs">
                    <span className="font-bold font-mono text-accent">LG{selectedOrder.id}</span>
                    <button 
                      type="button"
                      className="btn btn-ghost btn-xs text-accent" 
                      onClick={() => copyToClipboard(`LG${selectedOrder.id}`, 'nội dung chuyển khoản')}
                      style={{ padding: '2px 6px', fontSize: '0.75rem', minHeight: 'auto', border: '1px solid var(--accent-primary)', borderRadius: '4px', background: 'transparent' }}
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted italic text-center" style={{ fontSize: '0.75rem' }}>
                * Vui lòng nhập chính xác nội dung chuyển khoản để đơn hàng được duyệt tự động.
              </p>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default Orders;
