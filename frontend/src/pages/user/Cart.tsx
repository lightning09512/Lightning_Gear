import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/Button';
import { MdDeleteOutline, MdShoppingCart } from 'react-icons/md';

const Cart: React.FC = () => {
  const { items, localItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // For guest users, we need to fetch product details for localItems
  const [guestProducts, setGuestProducts] = useState<Record<number, Product>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!user && localItems.length > 0) {
      const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
          const ids = localItems.map(item => item.productId).join(',');
          // We might need a bulk endpoint, but for now we'll fetch individually or assume a small cart
          const promises = localItems.map(item => api.get(`/products/${item.productId}`));
          const results = await Promise.all(promises);
          
          const productMap: Record<number, Product> = {};
          results.forEach((res, index) => {
            if (res.data.success) {
              productMap[localItems[index].productId] = res.data.data;
            }
          });
          setGuestProducts(productMap);
        } catch (error) {
          console.error('Failed to load guest cart products', error);
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchProducts();
    }
  }, [user, localItems]);

  const cartList = user ? items : localItems;
  const isCartEmpty = cartList.length === 0;

  const calculateTotal = () => {
    if (user) {
      return items.reduce((total, item) => {
        const price = item.Product.salePrice || item.Product.price;
        return total + (price * item.quantity);
      }, 0);
    } else {
      return localItems.reduce((total, item) => {
        const product = guestProducts[item.productId];
        if (!product) return total;
        const price = product.salePrice || product.price;
        return total + (price * item.quantity);
      }, 0);
    }
  };

  const getProductInfo = (item: any) => {
    if (user) return item.Product;
    return guestProducts[item.productId];
  };

  const getItemId = (item: any) => {
    if (user) return item.id;
    return item.productId; // local item uses productId as identifier for update/remove
  };

  if (isCartEmpty) {
    return (
      <div className="container py-3xl">
        <div className="empty-state">
          <MdShoppingCart className="empty-state-icon" />
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p className="mt-sm mb-lg">Hãy khám phá các sản phẩm công nghệ tuyệt vời của chúng tôi.</p>
          <Button onClick={() => navigate('/products')}>Mua sắm ngay</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-xl">
      <h1 className="text-lg font-bold mb-lg">Giỏ hàng của bạn</h1>
      
      <div className="checkout-layout">
        <div className="card" style={{ padding: 0 }}>
          {cartList.map(item => {
            const product = getProductInfo(item);
            if (!product) return null;
            
            const itemId = getItemId(item);
            const price = product.salePrice || product.price;
            const primaryImage = product.images?.[0]?.imageUrl || 'https://placehold.co/100x100';

            return (
              <div key={itemId} className="cart-item">
                <Link to={`/products/${product.slug}`}>
                  <img src={primaryImage} alt={product.name} />
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${product.slug}`} className="cart-item-name block hover-text-accent">
                    {product.name}
                  </Link>
                  <div className="text-accent font-bold mt-xs">{formatPrice(price)}</div>
                </div>
                
                <div className="qty-selector">
                  <button 
                    className="qty-btn" 
                    onClick={() => updateQuantity(itemId, product.id, Math.max(1, item.quantity - 1))}
                  >-</button>
                  <input type="text" className="qty-value" value={item.quantity} readOnly />
                  <button 
                    className="qty-btn" 
                    onClick={() => updateQuantity(itemId, product.id, Math.min(product.stock, item.quantity + 1))}
                  >+</button>
                </div>
                
                <div className="font-bold text-right" style={{ width: 120 }}>
                  {formatPrice(price * item.quantity)}
                </div>
                
                <button 
                  className="cart-item-remove"
                  onClick={() => removeFromCart(itemId, product.id)}
                  title="Xóa sản phẩm"
                >
                  <MdDeleteOutline />
                </button>
              </div>
            );
          })}
        </div>

        <div className="order-summary">
          <h3 className="filter-title border-bottom pb-sm mb-md">Tóm tắt đơn hàng</h3>
          
          <div className="flex justify-between mb-sm text-sm">
            <span className="text-muted">Tạm tính:</span>
            <span className="font-bold">{formatPrice(calculateTotal())}</span>
          </div>
          <div className="flex justify-between mb-md text-sm border-bottom pb-md" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-muted">Phí giao hàng:</span>
            <span>Miễn phí</span>
          </div>
          
          <div className="flex justify-between items-center mb-xl">
            <span className="font-bold">Tổng cộng:</span>
            <span className="price" style={{ fontSize: '1.5rem' }}>{formatPrice(calculateTotal())}</span>
          </div>
          
          <Button fullWidth size="lg" onClick={() => navigate('/checkout')}>
            Tiến hành thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
