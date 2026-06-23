import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import Input from '../../components/Input';
import Button from '../../components/Button';

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

  if (!loading && items.length === 0) {
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
        navigate('/orders');
      }
    } catch (error: any) {
      toast(error.response?.data?.message || 'Lỗi khi đặt hàng', 'error');
    } finally {
      setSubmitting(false);
    }
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
            <label className="flex items-center gap-sm p-sm border-radius-md" style={{ background: formData.paymentMethod === 'cod' ? 'var(--bg-card-hover)' : 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="cod" 
                checked={formData.paymentMethod === 'cod'} 
                onChange={handleChange}
              />
              <span className="font-bold">Thanh toán khi nhận hàng (COD)</span>
            </label>
            <label className="flex items-center gap-sm p-sm border-radius-md" style={{ background: formData.paymentMethod === 'bank_transfer' ? 'var(--bg-card-hover)' : 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="paymentMethod" 
                value="bank_transfer" 
                checked={formData.paymentMethod === 'bank_transfer'} 
                onChange={handleChange}
              />
              <span className="font-bold">Chuyển khoản qua ngân hàng</span>
            </label>
            {formData.paymentMethod === 'bank_transfer' && (
              <div className="p-md bg-secondary text-sm border-radius-md mt-xs text-muted">
                Thông tin tài khoản sẽ được hiển thị sau khi bạn đặt hàng thành công.
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
    </div>
  );
};

export default Checkout;
