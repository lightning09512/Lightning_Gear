import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDesktopMac, MdLaptopMac, MdMemory, MdMonitor, MdMouse } from 'react-icons/md';
import api from '../../services/api';
import { Category, Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pcGamingProducts, setPcGamingProducts] = useState<Product[]>([]);
  const [linhKienProducts, setLinhKienProducts] = useState<Product[]>([]);
  const [manHinhProducts, setManHinhProducts] = useState<Product[]>([]);
  const [laptopProducts, setLaptopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Banner slider states & actual banners from ttgshop.vn
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    'https://ttgshop.vn/media/banner/worldcupttgshop1.jpg',
    'https://ttgshop.vn/media/banner/TTG-011.jpg',
    'https://ttgshop.vn/media/banner/gioi-thieu-ban-mua-hang-ttg.jpg',
    'https://ttgshop.vn/media/banner/ttg-ctkm-btsc.jpg',
    'https://ttgshop.vn/media/banner/ttg-021.jpg'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/products/featured'),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.data.filter((c: Category) => !c.parentId));
        }
        if (prodRes.data.success) {
          setPcGamingProducts(prodRes.data.data.pcGaming || []);
          setLinhKienProducts(prodRes.data.data.linhKien || []);
          setManHinhProducts(prodRes.data.data.manHinh || []);
          setLaptopProducts(prodRes.data.data.laptop || []);
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

  // Mock categories for the sidebar to ensure icons show nicely
  const sidebarCategories = [
    { name: 'PC GAMING', slug: 'pc-gaming', icon: <MdDesktopMac size={20} /> },
    { name: 'LAPTOP', slug: 'laptop', icon: <MdLaptopMac size={20} /> },
    { name: 'LINH KIỆN MÁY TÍNH', slug: 'linh-kien', icon: <MdMemory size={20} /> },
    { name: 'MÀN HÌNH', slug: 'man-hinh', icon: <MdMonitor size={20} /> },
    { name: 'GAMING GEAR', slug: 'phu-kien', icon: <MdMouse size={20} /> },
  ];

  return (
    <div className="home-page" style={{ backgroundColor: '#f1f1f1', paddingBottom: '40px' }}>
      
      {/* Top Banner & Sidebar Area */}
      <section className="container mt-md mb-lg" style={{ paddingTop: '16px' }}>
        <div className="flex gap-md" style={{ height: '400px' }}>
          {/* Left Sidebar Category Menu */}
          <div className="home-sidebar hide-mobile" style={{ width: '260px', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', color: '#fff', fontWeight: 'bold' }}>
              DANH MỤC SẢN PHẨM
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {sidebarCategories.map(cat => (
                <li key={cat.slug} style={{ borderBottom: '1px solid #eee' }}>
                  <Link to={`/category/${cat.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#333', textDecoration: 'none' }}>
                    <span style={{ color: 'var(--accent-primary)' }}>{cat.icon}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Center Banner Slider */}
          <div className="home-banner" style={{ flex: 1, background: '#fff', borderRadius: '8px', overflow: 'hidden', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {slides.map((slide, idx) => (
              <img
                key={slide}
                src={slide}
                alt={`Banner ${idx + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: idx === currentSlide ? 1 : 0,
                  transition: 'opacity 0.8s ease-in-out',
                }}
              />
            ))}
            
            {/* Slider Dots */}
            <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: 'none',
                    background: idx === currentSlide ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  aria-label={`Chọn Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Right small banners */}
          <div className="home-side-banners hide-mobile" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <img src="https://ttgshop.vn/media/banner/ttgshop-banner-under-slider-top-27122025-1.png" alt="Promo 1" style={{ width: '100%', flex: 1, borderRadius: '8px', objectFit: 'cover', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
             <img src="https://ttgshop.vn/media/banner/ttgshop-banner-under-slider-top-27122025-2.png" alt="Promo 2" style={{ width: '100%', flex: 1, borderRadius: '8px', objectFit: 'cover', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      </section>

      {/* PC GAMING Section */}
      {pcGamingProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-block" style={{ background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="section-header" style={{ borderBottom: '2px solid var(--accent-primary)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ fontSize: '1.25rem', margin: 0, textTransform: 'uppercase', color: 'var(--bg-secondary)' }}>Máy tính chơi game (PC Gaming)</h2>
                <Link to="/category/pc-gaming" className="view-all" style={{ fontSize: '0.85rem' }}>Xem tất cả &rarr;</Link>
              </div>
              <div className="grid grid-4" style={{ gap: '16px' }}>
                {pcGamingProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* LINH KIEN Section */}
      {linhKienProducts.length > 0 && (
        <section className="section" style={{ marginTop: '24px' }}>
          <div className="container">
            <div className="section-block" style={{ background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="section-header" style={{ borderBottom: '2px solid var(--accent-primary)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ fontSize: '1.25rem', margin: 0, textTransform: 'uppercase', color: 'var(--bg-secondary)' }}>Linh kiện máy tính</h2>
                <Link to="/category/linh-kien" className="view-all" style={{ fontSize: '0.85rem' }}>Xem tất cả &rarr;</Link>
              </div>
              <div className="grid grid-4" style={{ gap: '16px' }}>
                {linhKienProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MÀN HÌNH Section */}
      {manHinhProducts.length > 0 && (
        <section className="section" style={{ marginTop: '24px' }}>
          <div className="container">
            <div className="section-block" style={{ background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="section-header" style={{ borderBottom: '2px solid var(--accent-primary)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ fontSize: '1.25rem', margin: 0, textTransform: 'uppercase', color: 'var(--bg-secondary)' }}>Màn hình máy tính</h2>
                <Link to="/category/man-hinh" className="view-all" style={{ fontSize: '0.85rem' }}>Xem tất cả &rarr;</Link>
              </div>
              <div className="grid grid-4" style={{ gap: '16px' }}>
                {manHinhProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LAPTOP Section */}
      {laptopProducts.length > 0 && (
        <section className="section" style={{ marginTop: '24px' }}>
          <div className="container">
            <div className="section-block" style={{ background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div className="section-header" style={{ borderBottom: '2px solid var(--accent-primary)', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ fontSize: '1.25rem', margin: 0, textTransform: 'uppercase', color: 'var(--bg-secondary)' }}>Laptop</h2>
                <Link to="/category/laptop" className="view-all" style={{ fontSize: '0.85rem' }}>Xem tất cả &rarr;</Link>
              </div>
              <div className="grid grid-4" style={{ gap: '16px' }}>
                {laptopProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
