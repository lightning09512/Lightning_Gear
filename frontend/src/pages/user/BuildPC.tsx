import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatPrice';
import { MdAdd, MdRemove, MdDelete, MdPrint, MdShoppingCart, MdReplay, MdSearch, MdClose } from 'react-icons/md';

interface PartSection {
  id: string;
  name: string;
  categorySlug: string;
  icon: string;
}

const PART_SECTIONS: PartSection[] = [
  { id: 'cpu', name: 'Bộ vi xử lý (CPU)', categorySlug: 'cpu', icon: '⚙️' },
  { id: 'mainboard', name: 'Bo mạch chủ (Mainboard)', categorySlug: 'mainboard', icon: '📋' },
  { id: 'ram', name: 'Bộ nhớ trong (RAM)', categorySlug: 'ram', icon: '📟' },
  { id: 'gpu', name: 'Card đồ họa (GPU)', categorySlug: 'gpu', icon: '🎴' },
  { id: 'ssd', name: 'SSD / Ổ cứng', categorySlug: 'ssd-o-cung', icon: '💾' },
  { id: 'monitor', name: 'Màn hình', categorySlug: 'man-hinh', icon: '🖥️' },
  { id: 'keyboard', name: 'Bàn phím cơ', categorySlug: 'ban-phim-co', icon: '⌨️' },
  { id: 'mouse', name: 'Chuột gaming', categorySlug: 'chuot-gaming', icon: '🖱️' },
  { id: 'headset', name: 'Tai nghe gaming', categorySlug: 'tai-nghe', icon: '🎧' },
];

interface SelectedPart {
  product: Product;
  quantity: number;
}

const BuildPC: React.FC = () => {
  const [selectedParts, setSelectedParts] = useState<Record<string, SelectedPart>>(() => {
    const saved = localStorage.getItem('pc_build');
    return saved ? JSON.parse(saved) : {};
  });

  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Modal selector states
  const [activeSection, setActiveSection] = useState<PartSection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Save build to local storage
  useEffect(() => {
    localStorage.setItem('pc_build', JSON.stringify(selectedParts));
  }, [selectedParts]);

  // Fetch products inside modal
  useEffect(() => {
    if (activeSection) {
      fetchModalProducts(1);
    }
  }, [activeSection, searchQuery]);

  const fetchModalProducts = async (page: number) => {
    if (!activeSection) return;
    setModalLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        categorySlug: activeSection.categorySlug,
        search: searchQuery
      });
      const { data } = await api.get(`/products?${params.toString()}`);
      if (data.success) {
        setAvailableProducts(data.data.products || []);
        setModalPage(data.data.pagination.page);
        setModalTotalPages(data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load products for section', err);
      toast('Không thể tải danh sách sản phẩm', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    if (!activeSection) return;
    setSelectedParts(prev => ({
      ...prev,
      [activeSection.id]: { product, quantity: 1 }
    }));
    setActiveSection(null);
    setSearchQuery('');
    toast(`Đã chọn: ${product.name}`, 'success');
  };

  const handleRemovePart = (sectionId: string) => {
    setSelectedParts(prev => {
      const copy = { ...prev };
      delete copy[sectionId];
      return copy;
    });
  };

  const handleQuantityChange = (sectionId: string, delta: number) => {
    setSelectedParts(prev => {
      const item = prev[sectionId];
      if (!item) return prev;
      const newQty = Math.max(1, item.quantity + delta);
      return {
        ...prev,
        [sectionId]: { ...item, quantity: newQty }
      };
    });
  };

  const handleClearBuild = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ cấu hình đã chọn?')) {
      setSelectedParts({});
      localStorage.removeItem('pc_build');
      toast('Đã xóa cấu hình', 'info');
    }
  };

  const handleAddToCart = async () => {
    const selectedCount = Object.keys(selectedParts).length;
    if (selectedCount === 0) {
      toast('Vui lòng chọn ít nhất một linh kiện', 'warning');
      return;
    }

    setAddingToCart(true);
    try {
      for (const sectionId of Object.keys(selectedParts)) {
        const item = selectedParts[sectionId];
        await addToCart(item.product.id, item.quantity);
      }
      toast('Đã thêm toàn bộ linh kiện vào giỏ hàng!', 'success');
      setSelectedParts({});
      localStorage.removeItem('pc_build');
      navigate('/cart');
    } catch (err: any) {
      console.error(err);
      toast(err.toString() || 'Có lỗi xảy ra khi thêm giỏ hàng', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPrice = Object.values(selectedParts).reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="container py-xl build-pc-page">
      {/* Print only styling */}
      <style>{`
        @media print {
          header, footer, .navbar, .hide-print, .btn, .search-bar, .header-wrapper, .filter-sidebar {
            display: none !important;
          }
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .build-pc-page {
            padding: 0 !important;
          }
          .build-pc-table {
            border-collapse: collapse;
            width: 100%;
          }
          .build-pc-table th, .build-pc-table td {
            border: 1px solid #000 !important;
            padding: 8px !important;
          }
        }
      `}</style>

      <div className="flex justify-between items-center mb-lg hide-print">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-sm">
            <span>🖥️</span> Xây Dựng Cấu Hình PC Chuyên Nghiệp
          </h1>
          <p className="text-muted mt-xs">Lựa chọn các linh kiện tương thích để tạo nên bộ máy của riêng bạn</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-secondary flex items-center gap-xs" onClick={handleClearBuild}>
            <MdReplay size={18} /> Làm mới
          </button>
          <button className="btn btn-secondary flex items-center gap-xs" onClick={handlePrint}>
            <MdPrint size={18} /> In cấu hình
          </button>
        </div>
      </div>

      {/* Printable Area / Specification List */}
      <div className="flex gap-xl align-start build-layout" style={{ flexWrap: 'wrap' }}>
        <div className="build-items-list" style={{ flex: 2, minWidth: '320px' }}>
          <table className="build-pc-table w-full" style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', color: '#fff', textAlign: 'left' }}>
                <th style={{ padding: '16px', width: '20%' }}>Linh Kiện</th>
                <th style={{ padding: '16px', width: '50%' }}>Sản phẩm chọn lựa</th>
                <th style={{ padding: '16px', width: '15%', textAlign: 'center' }}>Số lượng</th>
                <th style={{ padding: '16px', width: '15%', textAlign: 'right' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {PART_SECTIONS.map(section => {
                const selected = selectedParts[section.id];
                return (
                  <tr key={section.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {/* Part Name column */}
                    <td style={{ padding: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{section.icon}</span>
                      <span>{section.name.split(' (')[0]}</span>
                    </td>
                    
                    {/* Selected product details */}
                    <td style={{ padding: '16px' }}>
                      {selected ? (
                        <div className="flex items-center gap-md">
                          <img 
                            src={selected.product.images?.[0]?.imageUrl || 'https://placehold.co/80x80/1a1a2e/00d4ff?text=No+Image'} 
                            alt={selected.product.name}
                            style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div className="font-bold text-sm mb-xs">{selected.product.name}</div>
                            <div className="text-accent font-bold">{formatPrice(selected.product.salePrice || selected.product.price)}</div>
                          </div>
                          <button 
                            className="btn btn-sm text-danger hide-print" 
                            style={{ padding: '4px', background: 'transparent', border: 'none' }}
                            onClick={() => handleRemovePart(section.id)}
                            aria-label="Remove part"
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-outline btn-sm hide-print flex items-center gap-xs"
                          onClick={() => {
                            setActiveSection(section);
                            setAvailableProducts([]);
                            setModalPage(1);
                            setModalTotalPages(1);
                          }}
                        >
                          <MdAdd size={16} /> Chọn {section.name.split(' (')[0]}
                        </button>
                      )}
                    </td>

                    {/* Quantity controls */}
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {selected ? (
                        <div className="flex items-center justify-center gap-xs">
                          <button 
                            className="btn btn-secondary hide-print" 
                            style={{ padding: '4px', minWidth: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => handleQuantityChange(section.id, -1)}
                          >
                            <MdRemove size={12} />
                          </button>
                          <span style={{ fontWeight: 600, minWidth: '20px' }}>{selected.quantity}</span>
                          <button 
                            className="btn btn-secondary hide-print" 
                            style={{ padding: '4px', minWidth: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => handleQuantityChange(section.id, 1)}
                          >
                            <MdAdd size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>

                    {/* Total column */}
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>
                      {selected ? (
                        formatPrice((selected.product.salePrice || selected.product.price) * selected.quantity)
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sticky Build Price Card */}
        <div className="build-summary-card hide-print" style={{ flex: 1, minWidth: '280px', position: 'sticky', top: '100px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 className="font-bold mb-md text-md" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Tóm tắt cấu hình</h3>
            
            <div className="flex justify-between items-center mb-md">
              <span className="text-muted">Tổng linh kiện:</span>
              <span className="font-bold">{Object.keys(selectedParts).length} / {PART_SECTIONS.length}</span>
            </div>

            <div className="mb-lg">
              <span className="text-muted block mb-xs">Tổng chi phí dự tính:</span>
              <div className="text-lg font-bold text-accent" style={{ fontSize: '1.6rem' }}>{formatPrice(totalPrice)}</div>
            </div>

            <button 
              className="btn btn-primary w-full flex items-center justify-center gap-sm py-md" 
              onClick={handleAddToCart}
              disabled={addingToCart || Object.keys(selectedParts).length === 0}
            >
              <MdShoppingCart size={20} />
              {addingToCart ? 'Đang thêm vào giỏ...' : 'Thêm tất cả vào giỏ hàng'}
            </button>
          </div>
        </div>
      </div>

      {/* Part Selection Modal */}
      {activeSection && (
        <div className="modal-overlay flex items-center justify-center hide-print" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000 }}>
          <div className="modal" style={{ background: '#fff', width: '90%', maxWidth: '750px', borderRadius: '8px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header flex justify-between items-center p-md" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="font-bold text-md">Chọn {activeSection.name}</h3>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px', border: 'none', background: 'transparent' }} 
                onClick={() => { setActiveSection(null); setSearchQuery(''); }}
                aria-label="Close modal"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Modal search bar */}
            <div className="p-md" style={{ borderBottom: '1px solid var(--border-color)', background: '#fcfcfc' }}>
              <div className="flex items-center gap-sm search-bar" style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px 12px' }}>
                <MdSearch size={20} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Nhập tên sản phẩm để tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Modal list area */}
            <div className="modal-body p-md" style={{ flex: 1, overflowY: 'auto' }}>
              {modalLoading ? (
                <div className="flex justify-center items-center py-xl">
                  <div className="spinner spinner-sm"></div>
                </div>
              ) : availableProducts.length > 0 ? (
                <div className="flex flex-col gap-md">
                  {availableProducts.map(prod => (
                    <div 
                      key={prod.id} 
                      className="flex items-center justify-between p-sm" 
                      style={{ border: '1px solid var(--border-color)', borderRadius: '6px', gap: '16px' }}
                    >
                      <img 
                        src={prod.images?.[0]?.imageUrl || 'https://placehold.co/80x80/1a1a2e/00d4ff?text=No+Image'} 
                        alt={prod.name}
                        style={{ width: '70px', height: '70px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="font-bold text-sm mb-xs" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.name}</div>
                        <div className="flex items-center gap-sm">
                          <span className="text-accent font-bold">{formatPrice(prod.salePrice || prod.price)}</span>
                          {prod.salePrice && (
                            <span className="text-muted text-xs line-through">{formatPrice(prod.price)}</span>
                          )}
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => handleSelectProduct(prod)}>
                        Chọn
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-xl text-muted">
                  Không tìm thấy linh kiện nào thích hợp
                </div>
              )}
            </div>

            {/* Modal pagination */}
            {modalTotalPages > 1 && (
              <div className="modal-footer flex justify-center gap-xs p-md" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={modalPage === 1}
                  onClick={() => fetchModalProducts(modalPage - 1)}
                >
                  Trước
                </button>
                <span className="flex items-center text-sm font-bold px-md">Trang {modalPage} / {modalTotalPages}</span>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={modalPage === modalTotalPages}
                  onClick={() => fetchModalProducts(modalPage + 1)}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildPC;
