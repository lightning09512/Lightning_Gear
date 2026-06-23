import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Product } from '../../types';
import { formatPrice, calcDiscount } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast';
import StarRating from '../../components/StarRating';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MdShoppingCart, MdLocalShipping, MdSecurity } from 'react-icons/md';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        if (data.success) {
          setProduct(data.data);
          const primaryImg = data.data.images?.find((img: any) => img.isPrimary)?.imageUrl || data.data.images?.[0]?.imageUrl;
          if (primaryImg) setActiveImage(primaryImg);
        }
      } catch (error) {
        toast('Sản phẩm không tồn tại', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate, toast]);

  const handleAddToCart = async (buyNow = false) => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast('Đã thêm vào giỏ hàng', 'success');
      if (buyNow) navigate('/checkout');
    } catch (error: any) {
      toast(error, 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQtyChange = (type: 'inc' | 'dec') => {
    if (type === 'inc' && quantity < (product?.stock || 0)) {
      setQuantity(q => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return null;

  const discount = calcDiscount(product.price, product.salePrice || 0);

  return (
    <div className="container py-xl">
      <div className="product-detail-layout">
        {/* Images */}
        <div className="image-gallery">
          <img src={activeImage} alt={product.name} className="main-image" />
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-list">
              {product.images.map(img => (
                <img
                  key={img.id}
                  src={img.imageUrl}
                  alt={product.name}
                  className={`thumbnail ${activeImage === img.imageUrl ? 'active' : ''}`}
                  onClick={() => setActiveImage(img.imageUrl)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.Brand && <div className="text-accent font-bold mb-xs">{product.Brand.name}</div>}
          <h1 className="text-lg font-bold mb-sm">{product.name}</h1>
          
          <div className="flex items-center gap-md mb-lg border-bottom pb-md" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-xs">
              <StarRating rating={product.avgRating || 0} readonly />
              <span className="text-muted text-sm">({product.totalReviews || 0} đánh giá)</span>
            </div>
            <div className="text-muted">|</div>
            <div className="text-sm">
              Tình trạng: <span className={product.stock > 0 ? 'text-success' : 'text-danger'}>
                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
              </span>
            </div>
          </div>

          <div className="mb-xl">
            {product.salePrice ? (
              <div className="flex items-end gap-md">
                <span className="price" style={{ fontSize: '2rem' }}>{formatPrice(product.salePrice)}</span>
                <span className="price-old pb-xs">{formatPrice(product.price)}</span>
                <span className="sale-badge mb-xs">-{discount}%</span>
              </div>
            ) : (
              <span className="price" style={{ fontSize: '2rem' }}>{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="flex items-center gap-lg mb-xl">
            <div className="qty-selector">
              <button className="qty-btn" onClick={() => handleQtyChange('dec')}>-</button>
              <input type="text" className="qty-value" value={quantity} readOnly />
              <button className="qty-btn" onClick={() => handleQtyChange('inc')}>+</button>
            </div>
            
            <Button 
              className="flex-1" 
              size="lg" 
              onClick={() => handleAddToCart(false)}
              disabled={product.stock === 0}
              isLoading={addingToCart}
            >
              <MdShoppingCart size={20} /> Thêm vào giỏ
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="flex-1"
              onClick={() => handleAddToCart(true)}
              disabled={product.stock === 0}
            >
              Mua ngay
            </Button>
          </div>

          {/* Benefits */}
          <div className="card card-glass mb-xl">
            <div className="flex items-center gap-md mb-md">
              <MdLocalShipping size={24} className="text-accent" />
              <div>
                <div className="font-bold text-sm">Giao hàng miễn phí</div>
                <div className="text-muted text-xs">Cho đơn hàng trên 1.000.000đ</div>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <MdSecurity size={24} className="text-success" />
              <div>
                <div className="font-bold text-sm">Bảo hành chính hãng</div>
                <div className="text-muted text-xs">Cam kết 100% chính hãng, bảo hành toàn quốc</div>
              </div>
            </div>
          </div>

          {/* Description & Specs */}
          <div className="mt-xl">
            <h3 className="filter-title border-bottom pb-sm mb-md" style={{ borderColor: 'var(--border-color)' }}>Mô tả sản phẩm</h3>
            <p className="text-secondary" style={{ lineHeight: 1.8 }}>{product.description}</p>
          </div>

          {product.specs && product.specs.length > 0 && (
            <div className="mt-xl">
              <h3 className="filter-title border-bottom pb-sm mb-md" style={{ borderColor: 'var(--border-color)' }}>Thông số kỹ thuật</h3>
              <table className="specs-table">
                <tbody>
                  {product.specs.map(spec => (
                    <tr key={spec.id}>
                      <td>{spec.specKey}</td>
                      <td>{spec.specValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
