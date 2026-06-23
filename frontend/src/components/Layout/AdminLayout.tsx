import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { MdDashboard, MdInventory, MdPeople, MdShoppingCart, MdCategory, MdLabel, MdLogout, MdHome } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <MdDashboard size={20} /> },
    { name: 'Sản phẩm', path: '/admin/products', icon: <MdInventory size={20} /> },
    { name: 'Đơn hàng', path: '/admin/orders', icon: <MdShoppingCart size={20} /> },
    { name: 'Khách hàng', path: '/admin/users', icon: <MdPeople size={20} /> },
    { name: 'Danh mục', path: '/admin/categories', icon: <MdCategory size={20} /> },
    { name: 'Thương hiệu', path: '/admin/brands', icon: <MdLabel size={20} /> },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin/dashboard" className="logo">
          <span className="bolt">⚡</span>
          <span>Admin Portal</span>
        </Link>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/" className="sidebar-link text-accent">
            <MdHome size={20} /> Về trang chủ
          </Link>
          <div className="sidebar-link text-danger" onClick={handleLogout}>
            <MdLogout size={20} /> Đăng xuất
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
