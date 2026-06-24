import React from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn, MdPhone, MdEmail, MdCheckCircle } from 'react-icons/md';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      {/* Trust Badges Section */}
      <div className="footer-trust">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <MdCheckCircle size={32} className="trust-icon" />
              <div>
                <h4>Sản phẩm chính hãng</h4>
                <p>Cam kết 100% chính hãng</p>
              </div>
            </div>
            <div className="trust-item">
              <MdCheckCircle size={32} className="trust-icon" />
              <div>
                <h4>Bảo hành tận nơi</h4>
                <p>Bảo hành uy tín, nhanh chóng</p>
              </div>
            </div>
            <div className="trust-item">
              <MdCheckCircle size={32} className="trust-icon" />
              <div>
                <h4>Giao hàng siêu tốc</h4>
                <p>Giao hàng nhanh toàn quốc</p>
              </div>
            </div>
            <div className="trust-item">
              <MdCheckCircle size={32} className="trust-icon" />
              <div>
                <h4>Hỗ trợ 24/7</h4>
                <p>Tư vấn nhiệt tình, chu đáo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="logo" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/favicon.svg" alt="NK Gear Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <span>NK Gear</span>
              </Link>
              <p style={{ marginTop: '16px' }}>
                NK Gear - Điểm đến tin cậy cho những tín đồ công nghệ, chuyên cung cấp PC Gaming, Laptop, linh kiện và phụ kiện máy tính chính hãng với giá tốt nhất thị trường.
              </p>
              <div className="contact-info mt-lg">
                <p><MdLocationOn /> 123 Đường Công Nghệ, Quận 1, TP.HCM</p>
                <p><MdPhone /> 098.655.2233</p>
                <p><MdEmail /> support@nkgear.com</p>
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Sản phẩm</h4>
              <div className="footer-links">
                <Link to="/category/pc-gaming" className="footer-link">PC Gaming</Link>
                <Link to="/category/laptop" className="footer-link">Laptop</Link>
                <Link to="/category/linh-kien" className="footer-link">Linh kiện máy tính</Link>
                <Link to="/category/man-hinh" className="footer-link">Màn hình</Link>
                <Link to="/category/phu-kien" className="footer-link">Gaming Gear</Link>
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Chính sách</h4>
              <div className="footer-links">
                <Link to="#" className="footer-link">Chính sách bảo hành</Link>
                <Link to="#" className="footer-link">Chính sách đổi trả</Link>
                <Link to="#" className="footer-link">Chính sách giao hàng</Link>
                <Link to="#" className="footer-link">Chính sách bảo mật</Link>
                <Link to="#" className="footer-link">Điều khoản sử dụng</Link>
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Hỗ trợ khách hàng</h4>
              <div className="footer-links">
                <Link to="#" className="footer-link">Hướng dẫn mua hàng trực tuyến</Link>
                <Link to="#" className="footer-link">Hướng dẫn thanh toán</Link>
                <Link to="#" className="footer-link">Hướng dẫn mua trả góp</Link>
                <Link to="#" className="footer-link">Góp ý, Khiếu nại</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} NK Gear. All rights reserved. Designed for TTG Shop Style.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
