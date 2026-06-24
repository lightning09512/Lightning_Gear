import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const UserLayout: React.FC = () => {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />

      {/* Floating Contact Buttons */}
      <div className="floating-contact-buttons hide-print">
        {/* Messenger */}
        <a 
          href="https://www.facebook.com/khanh.nguyen.390080" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="floating-btn messenger"
          title="Chat qua Facebook Messenger"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
            <path fill="#ffffff" d="M12 2C6.477 2 2 6.145 2 11.264c0 2.92 1.453 5.526 3.738 7.214V22l3.355-1.84c.883.245 1.815.378 2.775.378 5.523 0 10-4.146 10-9.264C22 6.145 17.523 2 12 2zm1.096 12.316l-2.605-2.779-5.079 2.78 5.578-5.918 2.656 2.779 5.028-2.78-5.578 5.918z"/>
          </svg>
        </a>

        {/* Zalo */}
        <a 
          href="https://zalo.me/0395990338" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="floating-btn zalo"
          title="Liên hệ qua Zalo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="38" height="38">
            <path fill="#0068ff" d="M100 10C50.29 10 10 45.82 10 90c0 18.06 6.7 34.69 18 48.06V175c0 3.2 2 6.1 5 7.1a8.4 8.4 0 0 0 2.7.5 8.2 8.2 0 0 0 5.6-2.3l23.7-22.3c13 4 27.2 6.1 41.6 6.1 49.7 0 90-35.82 90-80s-40.3-80-90-80z"/>
            <text x="100" y="112" font-family="'Inter', sans-serif" font-weight="bold" font-size="52" fill="#ffffff" text-anchor="middle">Zalo</text>
          </svg>
        </a>
      </div>
    </>
  );
};

export default UserLayout;
