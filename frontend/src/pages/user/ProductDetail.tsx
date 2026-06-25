import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MdShoppingCart, MdLocalShipping, MdSecurity, MdAssignmentReturn, MdCardGiftcard, MdPhone, MdCreditCard } from 'react-icons/md';
import api from '../../services/api';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../utils/imageUrl';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [cartModal, setCartModal] = useState<{ visible: boolean; status: 'loading' | 'success' }>({
    visible: false,
    status: 'loading'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${slug}`);
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-2xl text-center">
        <div className="spinner"></div>
        <p className="mt-md text-secondary">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-2xl text-center">
        <h2>Không tìm thấy sản phẩm!</h2>
        <Link to="/products" className="btn btn-primary mt-md">Quay lại danh sách</Link>
      </div>
    );
  }

  const primaryImage = getImageUrl(product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleAddToCart = async () => {
    try {
      setCartModal({ visible: true, status: 'loading' });
      await addToCart(product.id, 1);
      setTimeout(() => {
        setCartModal({ visible: true, status: 'success' });
        setTimeout(() => {
          setCartModal({ visible: false, status: 'loading' });
        }, 1500);
      }, 600);
    } catch (error) {
      console.error(error);
      setCartModal({ visible: false, status: 'loading' });
      alert('Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  const handleBuyNow = async () => {
    try {
      setCartModal({ visible: true, status: 'loading' });
      await addToCart(product.id, 1);
      setCartModal({ visible: true, status: 'success' });
      setTimeout(() => {
        setCartModal({ visible: false, status: 'loading' });
        navigate('/cart');
      }, 800);
    } catch (error) {
      console.error(error);
      setCartModal({ visible: false, status: 'loading' });
      alert('Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  return (
    <div className="container py-xl">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/products">Sản phẩm</Link>
        <span>/</span>
        <span className="text-primary font-medium truncate">{product.name}</span>
      </div>

      <div className="card product-detail-container mb-xl">
        {/* Left Column: Image */}
        <div className="product-image-gallery">
          <div className="product-image-main">
            <img src={primaryImage} alt={product.name} className="w-full h-auto rounded-sm" />
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="product-info">
          <h1 className="text-2xl font-bold mb-md text-heading leading-tight">{product.name}</h1>
          
          <div className="product-meta">
            <span>Mã SP: <strong>{product.id || 'Đang cập nhật'}</strong></span>
            <span>Tình trạng: <strong>{product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</strong></span>
            <span>Bảo hành: <strong>36 Tháng</strong></span>
          </div>

          <div className="price-group mb-lg flex items-end gap-md">
            {product.salePrice ? (
              <>
                <span className="price-sale text-3xl font-bold text-primary">{formatCurrency(product.salePrice)}</span>
                {product.price > product.salePrice && (
                  <span className="price-original text-lg text-secondary line-through mb-1">{formatCurrency(product.price)}</span>
                )}
              </>
            ) : (
              <span className="price-sale text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
            )}
          </div>

          {/* Promotional Box */}
          <div className="promo-box">
            <div className="promo-header">
              <MdCardGiftcard size={20} />
              KHUYẾN MÃI - QUÀ TẶNG
            </div>
            <div className="promo-body">
              <ul>
                <li>Sản phẩm đã được áp dụng chương trình khuyến mãi giảm giá Shock.</li>
                <li>Tặng kèm lót chuột Gaming Size XL trị giá 150.000đ.</li>
                <li>Hỗ trợ cài đặt hệ điều hành và phần mềm miễn phí trọn đời.</li>
                <li>Miễn phí vận chuyển toàn quốc cho đơn hàng PC.</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <button className="btn-buy-now" onClick={handleBuyNow}>
            <strong>MUA NGAY</strong>
            <span>Giao hàng tận nơi hoặc nhận tại cửa hàng</span>
          </button>

          <div className="action-buttons">
            <button className="btn-outline-primary" onClick={handleAddToCart}>
              <MdShoppingCart size={18} />
              THÊM VÀO GIỎ
            </button>
            <button className="btn-outline-primary" onClick={() => alert('Tính năng đang phát triển')}>
              <MdCreditCard size={18} />
              MUA TRẢ GÓP
            </button>
          </div>

          {/* Trust Policies */}
          <div className="policy-list mt-md">
            <div className="policy-item">
              <MdLocalShipping className="policy-icon" />
              <span><strong>Giao hàng siêu tốc</strong> trong 2h nội thành</span>
            </div>
            <div className="policy-item">
              <MdSecurity className="policy-icon" />
              <span><strong>Cam kết 100%</strong> hàng chính hãng, mới nguyên seal</span>
            </div>
            <div className="policy-item">
              <MdAssignmentReturn className="policy-icon" />
              <span><strong>Đổi trả 30 ngày</strong> nếu có lỗi từ nhà sản xuất</span>
            </div>
            <div className="policy-item">
              <MdPhone className="policy-icon" />
              <span><strong>Hỗ trợ kỹ thuật 24/7:</strong> 032.6694.168</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="card mt-xl">
        <h3 className="filter-title border-bottom pb-sm mb-lg text-xl uppercase" style={{ borderColor: 'var(--border-color)' }}>
          Đặc điểm nổi bật & Thông số kỹ thuật
        </h3>
        
        {/* Render HTML content safely */}
        <div 
          className="html-content" 
          dangerouslySetInnerHTML={{ __html: product.description || '<p>Đang cập nhật mô tả...</p>' }} 
        />
      </div>

      {/* Success/Loading Modal */}
      {cartModal.visible && (
        <div className="cart-modal-overlay">
          <div className="cart-modal-content">
            {cartModal.status === 'loading' ? (
              <div className="cart-modal-spinner"></div>
            ) : (
              <div className="cart-modal-success-icon">✓</div>
            )}
            <p className="cart-modal-text">
              {cartModal.status === 'loading'
                ? 'Đang thêm vào giỏ hàng...'
                : 'Thêm sản phẩm vào giỏ hàng thành công!'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
