import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo">
            <span className="bolt">⚡</span>
            <span>Lightning Gear</span>
          </Link>
          <p>
            Chuyên cung cấp PC Gaming, Laptop, linh kiện và phụ kiện máy tính chính hãng với giá tốt nhất thị trường.
          </p>
        </div>

        <div>
          <h4 className="footer-heading">Sản phẩm</h4>
          <div className="footer-links">
            <Link to="/category/pc-gaming" className="footer-link">PC Gaming</Link>
            <Link to="/category/laptop" className="footer-link">Laptop</Link>
            <Link to="/category/linh-kien" className="footer-link">Linh kiện máy tính</Link>
            <Link to="/category/man-hinh" className="footer-link">Màn hình</Link>
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Hỗ trợ</h4>
          <div className="footer-links">
            <Link to="#" className="footer-link">Hướng dẫn mua hàng</Link>
            <Link to="#" className="footer-link">Chính sách bảo hành</Link>
            <Link to="#" className="footer-link">Chính sách đổi trả</Link>
            <Link to="#" className="footer-link">Tra cứu đơn hàng</Link>
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Liên hệ</h4>
          <div className="footer-links">
            <a href="tel:1900xxxx" className="footer-link">Hotline: 1900 xxxx</a>
            <a href="mailto:support@lightninggear.com" className="footer-link">Email: support@lightninggear.com</a>
            <p className="footer-link">Địa chỉ: 123 Đường Công Nghệ, Quận 1, TP.HCM</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Lightning Gear. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
