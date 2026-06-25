import React from 'react';
import { Product } from '../types';
import { formatPrice, calcDiscount } from '../utils/formatPrice';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { getImageUrl } from '../utils/imageUrl';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const primaryImage = getImageUrl(product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl);
  const discount = calcDiscount(product.price, product.salePrice || 0);

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="image-wrapper">
        <img src={primaryImage} alt={product.name} className="product-image" loading="lazy" />
        {discount > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className="sale-badge">-{discount}%</span>
          </div>
        )}
      </div>
      <div className="product-info">
        {product.Brand && (
          <div className="product-brand">{product.Brand.name}</div>
        )}
        <h3 className="product-name" title={product.name}>{product.name}</h3>
        
        {product.avgRating !== undefined && (
          <div className="flex items-center gap-xs mb-sm">
            <StarRating rating={product.avgRating} size={14} readonly />
            <span className="text-xs text-muted">({product.totalReviews || 0})</span>
          </div>
        )}

        <div className="product-price">
          {product.salePrice ? (
            <>
              <span className="price">{formatPrice(product.salePrice)}</span>
              <span className="price-old">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="price">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
