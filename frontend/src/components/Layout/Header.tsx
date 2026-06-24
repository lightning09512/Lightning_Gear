import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdShoppingCart, MdPerson, MdSearch, MdLocationOn, MdPhone, MdComputer, MdMenu, MdKeyboardArrowDown } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { items, localItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cartCount = user ? items.reduce((acc, item) => acc + item.quantity, 0) : localItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="header-wrapper">
      {/* 1. TOP BAR */}
      <div className="header-top">
        <div className="container">
          <div className="header-top-inner">
            <div className="header-top-left">
              <a href="#" className="top-link"><MdLocationOn /> Hệ thống showroom</a>
              <a href="#" className="top-link"><MdPhone /> Bán hàng trực tuyến</a>
              <Link to="/products" className="top-link">Sản phẩm khuyến mãi</Link>
            </div>
            <div className="header-top-right">
              {user ? (
                <div className="user-menu" ref={menuRef}>
                  <div className="user-menu-trigger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <MdPerson size={16} />
                    <span>Xin chào, {user.username.split(' ')[0]}</span>
                    <MdKeyboardArrowDown />
                  </div>
                  {isMenuOpen && (
                    <div className="user-dropdown">
                      <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>Hồ sơ cá nhân</Link>
                      <Link to="/orders" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>Đơn hàng</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin/dashboard" className="dropdown-item text-accent" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                      )}
                      <div className="dropdown-item text-danger" onClick={handleLogout}>Đăng xuất</div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/register" className="top-link">Đăng ký</Link>
                  <span className="separator">|</span>
                  <Link to="/login" className="top-link">Đăng nhập</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE BAR */}
      <div className="header-middle">
        <div className="container">
          <div className="header-middle-inner">
            <Link to="/" className="logo">
              <span className="bolt">⚡</span>
              <span>Lightning Gear</span>
            </Link>

            <form className="search-bar" onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                <MdSearch size={24} />
              </button>
            </form>

            <div className="header-actions">
              <a href="tel:0986552233" className="action-item hide-mobile">
                <div className="action-icon"><MdPhone size={20} /></div>
                <div className="action-text">
                  <span className="label">Hotline mua hàng</span>
                  <span className="value">098.655.2233</span>
                </div>
              </a>

              <Link to="/buildpc" className="action-item hide-mobile">
                <div className="action-icon"><MdComputer size={20} /></div>
                <div className="action-text">
                  <span className="label">Xây dựng</span>
                  <span className="value">Cấu hình PC</span>
                </div>
              </Link>

              <Link to="/cart" className="action-item">
                <div className="action-icon cart-icon">
                  <MdShoppingCart size={20} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </div>
                <div className="action-text hide-mobile">
                  <span className="value">Giỏ hàng</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM NAV */}
      <div className="header-bottom">
        <div className="container">
          <div className="header-bottom-inner">
            <div 
              className="category-menu-btn"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <MdMenu size={20} />
              <span>DANH MỤC SẢN PHẨM</span>
              
              {/* Category Dropdown (visible on hover) */}
              <div className={`category-dropdown ${isCategoryOpen ? 'show' : ''}`}>
                <Link to="/category/pc-gaming" className="cat-item">PC GAMING</Link>
                <Link to="/category/laptop" className="cat-item">LAPTOP</Link>
                <Link to="/category/linh-kien" className="cat-item">LINH KIỆN MÁY TÍNH</Link>
                <Link to="/category/man-hinh" className="cat-item">MÀN HÌNH</Link>
                <Link to="/category/phu-kien" className="cat-item">GAMING GEAR</Link>
              </div>
            </div>

            <nav className="main-nav">
              <Link to="/category/pc-gaming" className="nav-link">PC Gaming</Link>
              <Link to="/category/linh-kien" className="nav-link">Linh kiện</Link>
              <Link to="/category/man-hinh" className="nav-link">Màn hình</Link>
              <Link to="/products" className="nav-link">Tất cả sản phẩm</Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
