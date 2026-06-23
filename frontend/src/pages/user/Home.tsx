import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Category, Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/products/featured'),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.data.filter((c: Category) => !c.parentId).slice(0, 4));
        }
        if (prodRes.data.success) {
          setFeaturedProducts(prodRes.data.data);
        }
      } catch (error) {
        console.error('Failed to load home data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-tag">
              <span className="bolt">⚡</span> Hiệu năng cực đỉnh
            </div>
            <h1>Nâng tầm trải nghiệm Gaming của bạn</h1>
            <p>
              Khám phá các sản phẩm công nghệ tiên tiến nhất từ PC Gaming, Laptop, cho đến các linh kiện hiệu năng cao để xây dựng góc máy trong mơ của bạn.
            </p>
            <div className="flex gap-md">
              <Link to="/products" className="btn btn-primary btn-lg">Mua sắm ngay</Link>
              <Link to="/category/pc-gaming" className="btn btn-secondary btn-lg">Xem cấu hình PC</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section bg-secondary">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Danh mục nổi bật</h2>
          </div>
          <div className="grid grid-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="category-card">
                <div className="category-icon">{cat.icon || '💻'}</div>
                <div className="category-name">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sản phẩm bán chạy</h2>
            <Link to="/products" className="view-all">Xem tất cả &rarr;</Link>
          </div>
          <div className="grid grid-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
