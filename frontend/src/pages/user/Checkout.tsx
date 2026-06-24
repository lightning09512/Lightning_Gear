import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { items, loading, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    phone: user?.phone || '',
    address: user?.address || '',
    note: '',
    paymentMethod: 'cod',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.username,
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
      }));
    }
  }, [user]);

  // Prevent guest access or empty cart checkout
  if (!user) {
    toast('Vui lòng đăng nhập để tiến hành thanh toán', 'info');
    return <Navigate to="/login" state={{ from: { pathname: '/checkout' } }} replace />;
  }

  if (!loading && items.length === 0 && !showPaymentModal && !createdOrder) {
    return <Navigate to="/cart" replace />;
  }

  const total = items.reduce((sum, item) => {
    const price = item.Product.salePrice || item.Product.price;
    return sum + (price * item.quantity);
  }, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast('Vui lòng điền đầy đủ thông tin giao hàng', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        },
        paymentMethod: formData.paymentMethod,
        note: formData.note,
      };

      const { data } = await api.post('/orders', orderData);
      
      if (data.success) {
        toast('Đặt hàng thành công!', 'success');
        clearCart();
        if (formData.paymentMethod === 'cod') {
          navigate('/orders');
        } else {
          setCreatedOrder(data.data);
          setShowPaymentModal(true);
        }
      }
    } catch (error: any) {
      toast(error.response?.data?.message || 'Lỗi khi đặt hàng', 'error');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="container py-xl">
      <h1 className="text-lg font-bold mb-lg">Thanh toán</h1>
      
      <form onSubmit={handleSubmit} className="checkout-layout">
        <div className="card">
          <h3 className="filter-title border-bottom pb-sm mb-md">Thông tin giao hàng</h3>
          
          <div className="grid grid-2 mb-md">
            <Input
              label="Họ và tên người nhận *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <Input
              label="Số điện thoại *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <Input
            label="Địa chỉ giao hàng (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố) *"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="mb-md"
          />
          
          <Input
            as="textarea"
            label="Ghi chú đơn hàng"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Ví dụ: Giao hàng giờ hành chính"
            className="mb-lg"
          />

          <h3 className="filter-title border-bottom pb-sm mb-md">Phương thức thanh toán</h3>
          <div className="flex flex-col gap-sm">
            {/* COD */}
            <label className="flex items-center gap-sm p-sm border-radius-md" style={{ background: formData.paymentMethod === 'cod' ? 'var(--bg-card-hover)' : 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="cod" 
                checked={formData.paymentMethod === 'cod'} 
                onChange={handleChange}
              />
              <span style={{ fontSize: '1.2rem' }}>💵</span>
              <div style={{ flex: 1 }}>
                <span className="font-bold block">Thanh toán khi nhận hàng (COD)</span>
                <span className="text-xs text-muted block">Nhận hàng, kiểm tra rồi mới thanh toán tiền mặt</span>
              </div>
            </label>

            {/* Bank Transfer */}
            <label className="flex items-center gap-sm p-sm border-radius-md" style={{ background: formData.paymentMethod === 'bank_transfer' ? 'var(--bg-card-hover)' : 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="bank_transfer" 
                checked={formData.paymentMethod === 'bank_transfer'} 
                onChange={handleChange}
              />
              <span style={{ fontSize: '1.2rem' }}>🏦</span>
              <div style={{ flex: 1 }}>
                <span className="font-bold block">Chuyển khoản qua ngân hàng (QR Code 24/7)</span>
                <span className="text-xs text-muted block">Quét mã QR chuyển khoản nhanh 24/7 tiện lợi</span>
              </div>
            </label>

            {/* MoMo */}
            <label className="flex items-center gap-sm p-sm border-radius-md" style={{ background: formData.paymentMethod === 'momo' ? 'var(--bg-card-hover)' : 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="momo" 
                checked={formData.paymentMethod === 'momo'} 
                onChange={handleChange}
              />
              <span style={{ fontSize: '1.2rem' }}>🌸</span>
              <div style={{ flex: 1 }}>
                <span className="font-bold block">Thanh toán qua ví MoMo</span>
                <span className="text-xs text-muted block">Thanh toán trực tiếp bằng ứng dụng MoMo</span>
              </div>
            </label>

            {/* ZaloPay */}
            <label className="flex items-center gap-sm p-sm border-radius-md" style={{ background: formData.paymentMethod === 'zalopay' ? 'var(--bg-card-hover)' : 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="zalopay" 
                checked={formData.paymentMethod === 'zalopay'} 
                onChange={handleChange}
              />
              <span style={{ fontSize: '1.2rem' }}>📱</span>
              <div style={{ flex: 1 }}>
                <span className="font-bold block">Thanh toán qua ví ZaloPay</span>
                <span className="text-xs text-muted block">Thanh toán an toàn, bảo mật qua ZaloPay</span>
              </div>
            </label>

            {/* VNPay */}
            <label className="flex items-center gap-sm p-sm border-radius-md" style={{ background: formData.paymentMethod === 'vnpay' ? 'var(--bg-card-hover)' : 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="vnpay" 
                checked={formData.paymentMethod === 'vnpay'} 
                onChange={handleChange}
              />
              <span style={{ fontSize: '1.2rem' }}>💳</span>
              <div style={{ flex: 1 }}>
                <span className="font-bold block">Cổng thanh toán VNPay-QR</span>
                <span className="text-xs text-muted block">Quét QR từ hơn 40 ứng dụng ngân hàng và Ví điện tử</span>
              </div>
            </label>

            {/* Credit Card */}
            <label className="flex items-center gap-sm p-sm border-radius-md" style={{ background: formData.paymentMethod === 'credit_card' ? 'var(--bg-card-hover)' : 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="credit_card" 
                checked={formData.paymentMethod === 'credit_card'} 
                onChange={handleChange}
              />
              <span style={{ fontSize: '1.2rem' }}>🌐</span>
              <div style={{ flex: 1 }}>
                <span className="font-bold block">Thẻ tín dụng quốc tế (Visa, Mastercard, JCB)</span>
                <span className="text-xs text-muted block">Hỗ trợ các thẻ phát hành trong nước và quốc tế</span>
              </div>
            </label>

            {/* Installment */}
            <label className="flex items-center gap-sm p-sm border-radius-md" style={{ background: formData.paymentMethod === 'installment' ? 'var(--bg-card-hover)' : 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="installment" 
                checked={formData.paymentMethod === 'installment'} 
                onChange={handleChange}
              />
              <span style={{ fontSize: '1.2rem' }}>📈</span>
              <div style={{ flex: 1 }}>
                <span className="font-bold block">Trả góp 0% lãi suất qua thẻ tín dụng</span>
                <span className="text-xs text-muted block">Kỳ hạn trả góp linh hoạt từ 3 đến 12 tháng</span>
              </div>
            </label>

            {/* Bank Transfer Details */}
            {formData.paymentMethod === 'bank_transfer' && (
              <div className="p-md text-sm mt-xs text-muted" style={{ background: 'var(--bg-primary, #f9f9f9)', border: '1px dashed var(--accent-primary)', borderRadius: '8px', padding: '12px' }}>
                <div className="font-bold text-accent mb-xs">Thông tin tài khoản ngân hàng:</div>
                <div>Ngân hàng: <strong>MB Bank (Ngân hàng Quân Đội)</strong></div>
                <div>Số tài khoản: <strong>0986552233</strong></div>
                <div>Chủ tài khoản: <strong>NK GEAR</strong></div>
                <div>Nội dung chuyển khoản: <strong>LG [Mã đơn hàng]</strong></div>
                <div className="text-xs text-muted mt-sm">* Đơn hàng sẽ được xử lý ngay sau khi hệ thống nhận được chuyển khoản thành công.</div>
              </div>
            )}

            {/* Online payment instructions */}
            {(formData.paymentMethod === 'momo' || formData.paymentMethod === 'zalopay' || formData.paymentMethod === 'vnpay' || formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'installment') && (
              <div className="p-md text-sm mt-xs text-muted" style={{ background: 'var(--bg-primary, #f9f9f9)', border: '1px dashed var(--accent-primary)', borderRadius: '8px', padding: '12px' }}>
                <div className="font-bold text-accent mb-xs">Cổng thanh toán trực tuyến:</div>
                <div>Cổng thanh toán đang hoạt động ở chế độ Sandbox (Thử nghiệm). Sau khi nhấn "Hoàn tất đặt hàng", giao dịch sẽ được ghi nhận thành công tự động.</div>
              </div>
            )}
          </div>
        </div>

        <div className="order-summary">
          <h3 className="filter-title border-bottom pb-sm mb-md">Đơn hàng của bạn ({items.length} sản phẩm)</h3>
          
          <div className="flex flex-col gap-sm mb-md max-h-[300px] overflow-y-auto">
            {items.map(item => {
              const price = item.Product.salePrice || item.Product.price;
              return (
                <div key={item.id} className="flex justify-between items-center text-sm pb-sm border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex-1" style={{ paddingRight: 10 }}>
                    <div className="font-bold" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.Product.name}</div>
                    <div className="text-muted text-xs">SL: {item.quantity}</div>
                  </div>
                  <div className="font-bold text-accent">{formatPrice(price * item.quantity)}</div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mb-sm text-sm">
            <span className="text-muted">Tạm tính:</span>
            <span className="font-bold">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between mb-md text-sm border-bottom pb-md" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-muted">Phí giao hàng:</span>
            <span>Miễn phí</span>
          </div>
          
          <div className="flex justify-between items-center mb-xl">
            <span className="font-bold">Tổng cộng:</span>
            <span className="price" style={{ fontSize: '1.5rem' }}>{formatPrice(total)}</span>
          </div>
          
          <Button type="submit" fullWidth size="lg" isLoading={submitting}>
            Hoàn tất đặt hàng
          </Button>
        </div>
      </form>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          navigate('/orders');
        }}
        title="Thanh toán đơn hàng"
        footer={
          <div className="flex gap-sm justify-end w-full" style={{ width: '100%' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowPaymentModal(false);
                navigate('/orders');
              }}
            >
              Xem đơn hàng
            </Button>
            <Button
              onClick={() => {
                toast('Yêu cầu thanh toán của bạn đang được hệ thống xác nhận!', 'success');
                setShowPaymentModal(false);
                navigate('/orders');
              }}
            >
              Tôi đã chuyển khoản
            </Button>
          </div>
        }
      >
        {createdOrder && (() => {
          const paymentInfo = getPaymentDetails(createdOrder.paymentMethod);
          return (
            <div className="text-center p-sm">
              <div className="text-success font-bold text-lg mb-sm">🎉 Đặt hàng thành công!</div>
              
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
                Đơn hàng <strong>#{createdOrder.id}</strong> đã được khởi tạo. {paymentInfo.instructions}
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
                  src={`https://img.vietqr.io/image/MB-0986552233-compact.png?amount=${createdOrder.totalAmount}&addInfo=LG${createdOrder.id}&accountName=NK%20GEAR`}
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
                  <span className="font-bold">NK GEAR</span>
                </div>
                <div className="flex justify-between items-center py-xs border-bottom" style={{ borderColor: 'var(--border-color)', paddingBottom: '6px', paddingTop: '6px' }}>
                  <span className="text-muted">Số tiền:</span>
                  <div className="flex items-center gap-xs">
                    <span className="font-bold text-accent">{formatPrice(createdOrder.totalAmount)}</span>
                    <button 
                      type="button"
                      className="btn btn-ghost btn-xs text-accent" 
                      onClick={() => copyToClipboard(String(createdOrder.totalAmount), 'số tiền')}
                      style={{ padding: '2px 6px', fontSize: '0.75rem', minHeight: 'auto', border: '1px solid var(--accent-primary)', borderRadius: '4px', background: 'transparent' }}
                    >
                      Sao chép
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-xs" style={{ paddingTop: '6px' }}>
                  <span className="text-muted">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-xs">
                    <span className="font-bold font-mono text-accent">LG{createdOrder.id}</span>
                    <button 
                      type="button"
                      className="btn btn-ghost btn-xs text-accent" 
                      onClick={() => copyToClipboard(`LG${createdOrder.id}`, 'nội dung chuyển khoản')}
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

export default Checkout;
