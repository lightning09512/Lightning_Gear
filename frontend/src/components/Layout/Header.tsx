import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdShoppingCart, MdPerson, MdLogout, MdDashboard, MdListAlt } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import SearchBar from '../SearchBar';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { items, localItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'PC Gaming', path: '/category/pc-gaming' },
    { name: 'Laptop', path: '/category/laptop' },
    { name: 'Linh kiện', path: '/category/linh-kien' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="bolt">⚡</span>
          <span>Lightning Gear</span>
        </Link>

        <nav className="nav-links">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <SearchBar />

        <div className="header-actions">
          <button className="cart-btn" onClick={() => navigate('/cart')}>
            <MdShoppingCart />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>

          <div className="user-menu" ref={menuRef}>
            <div 
              className="user-menu-trigger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MdPerson size={20} />
              <span className="text-sm font-bold hide-mobile">
                {user ? user.username.split(' ')[0] : 'Tài khoản'}
              </span>
            </div>

            {isMenuOpen && (
              <div className="user-dropdown">
                {user ? (
                  <>
                    <div className="p-sm text-sm text-muted">Xin chào, <strong>{user.username}</strong></div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                      <MdPerson size={18} /> Hồ sơ cá nhân
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                      <MdListAlt size={18} /> Lịch sử đơn hàng
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="dropdown-item text-accent" onClick={() => setIsMenuOpen(false)}>
                        <MdDashboard size={18} /> Admin Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item text-danger" onClick={handleLogout}>
                      <MdLogout size={18} /> Đăng xuất
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>Đăng nhập</Link>
                    <Link to="/register" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>Đăng ký</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
