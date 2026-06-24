import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Product, PaginatedResponse, Category, Brand } from '../../types';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { MdAdd, MdEdit, MdDelete, MdCheck, MdClose } from 'react-icons/md';
import { MdOutlineAdd, MdOutlineDelete } from 'react-icons/md';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  
  // Categories & Brands
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<Array<{ specKey: string; specValue: string }>>([]);

  const { toast } = useToast();

  useEffect(() => {
    fetchProducts(1);
    fetchMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMetadata = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/admin/categories/all'),
        api.get('/admin/brands')
      ]);
      if (catRes.data.success) {
        setCategories(catRes.data.data);
      }
      if (brandRes.data.success) {
        setBrands(brandRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories or brands:', error);
    }
  };

  const fetchProducts = async (page: number, q = search) => {
    setLoading(true);
    try {
      const url = q ? `/admin/products?page=${page}&search=${encodeURIComponent(q)}` : `/admin/products?page=${page}`;
      const { data } = await api.get<PaginatedResponse<Product>>(url);
      if (data.success) {
        setProducts(data.data.products || []);
        setPagination({
          page: data.data.pagination.page,
          totalPages: data.data.pagination.totalPages
        });
      }
    } catch (error) {
      toast('Lỗi khi tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1, search);
  };

  const toggleActive = async (id: number) => {
    try {
      const { data } = await api.patch(`/admin/products/${id}/toggle`);
      if (data.success) {
        setProducts(products.map(p => p.id === id ? { ...p, isActive: data.data.isActive } : p));
        toast('Cập nhật trạng thái thành công', 'success');
      }
    } catch (error) {
      toast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  // Open add modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setSalePrice('');
    setStock('');
    setCategoryId('');
    setBrandId('');
    setImageUrl('');
    setDescription('');
    setSpecs([]);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setSalePrice(product.salePrice ? product.salePrice.toString() : '');
    setStock(product.stock.toString());
    setCategoryId(product.categoryId ? product.categoryId.toString() : '');
    setBrandId(product.brandId ? product.brandId.toString() : '');
    setImageUrl(product.images?.[0]?.imageUrl || '');
    setDescription(product.description || '');
    
    // Parse specifications
    if (product.specs && product.specs.length > 0) {
      setSpecs(product.specs.map(s => ({ specKey: s.specKey, specValue: s.specValue })));
    } else {
      setSpecs([]);
    }
    setIsModalOpen(true);
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác.')) {
      try {
        const { data } = await api.delete(`/admin/products/${id}`);
        if (data.success) {
          toast('Xóa sản phẩm thành công', 'success');
          fetchProducts(pagination.page);
        }
      } catch (error: any) {
        toast(error.response?.data?.message || 'Lỗi khi xóa sản phẩm', 'error');
      }
    }
  };

  // Handle spec array manipulation
  const handleAddSpec = () => {
    setSpecs([...specs, { specKey: '', specValue: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, key: 'specKey' | 'specValue', value: string) => {
    setSpecs(specs.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  // Submit modal form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast('Vui lòng nhập tên và giá sản phẩm', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: parseInt(stock) || 0,
        categoryId: categoryId ? parseInt(categoryId) : null,
        brandId: brandId ? parseInt(brandId) : null,
        imageUrl,
        description,
        specs: specs.filter(s => s.specKey.trim() !== '') // Filter empty keys
      };

      if (editingProduct) {
        // Edit product
        const { data } = await api.put(`/admin/products/${editingProduct.id}`, payload);
        if (data.success) {
          toast('Cập nhật sản phẩm thành công', 'success');
          setIsModalOpen(false);
          fetchProducts(pagination.page);
        }
      } else {
        // Create product
        const { data } = await api.post('/admin/products', payload);
        if (data.success) {
          toast('Tạo sản phẩm thành công', 'success');
          setIsModalOpen(false);
          fetchProducts(1);
        }
      }
    } catch (error: any) {
      toast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1 className="text-lg font-bold">Quản lý sản phẩm</h1>
        <Button onClick={handleOpenAdd} icon><MdAdd size={20} /> Thêm sản phẩm mới</Button>
      </div>

      <div className="card mb-lg p-md">
        <form onSubmit={handleSearch} className="flex gap-md">
          <input
            type="text"
            className="input flex-1"
            placeholder="Tìm kiếm theo tên hoặc ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button type="submit">Tìm kiếm</Button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá gốc</th>
                  <th>Giá KM</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-lg text-muted">Không tìm thấy sản phẩm nào</td>
                  </tr>
                ) : (
                  products.map(product => {
                    const primaryImage = product.images?.[0]?.imageUrl || 'https://placehold.co/50x50';
                    return (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>
                          <img src={primaryImage} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                        </td>
                        <td>
                          <div className="font-bold" style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {product.name}
                          </div>
                          <div className="text-xs text-muted">
                            {product.Category?.name || 'Chưa phân loại'} | {product.Brand?.name || 'Không có thương hiệu'}
                          </div>
                        </td>
                        <td>{formatPrice(product.price)}</td>
                        <td>{product.salePrice ? formatPrice(product.salePrice) : '-'}</td>
                        <td>
                          <span className={product.stock <= 5 ? 'text-danger font-bold' : ''}>{product.stock}</span>
                        </td>
                        <td>
                          <button 
                            className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}
                            onClick={() => toggleActive(product.id)}
                            style={{ border: 'none', cursor: 'pointer' }}
                          >
                            {product.isActive ? <><MdCheck className="mr-xs"/> Hiện</> : <><MdClose className="mr-xs"/> Ẩn</>}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex justify-end gap-xs">
                            <button onClick={() => handleOpenEdit(product)} className="btn btn-ghost btn-icon" title="Chỉnh sửa"><MdEdit size={18} /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="btn btn-ghost btn-icon text-danger" title="Xóa"><MdDelete size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-md border-top" style={{ borderColor: 'var(--border-color)' }}>
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages} 
              onPageChange={(page) => fetchProducts(page)} 
            />
          </div>
        </div>
      )}

      {/* CRUD Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} isLoading={submitting}>Lưu lại</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="grid grid-2">
            <div className="input-group">
              <label>Tên sản phẩm *</label>
              <input 
                type="text" 
                className="input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Số lượng tồn kho</label>
              <input 
                type="number" 
                className="input" 
                value={stock} 
                onChange={e => setStock(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Giá gốc (VNĐ) *</label>
              <input 
                type="number" 
                className="input" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <label>Giá khuyến mãi (VNĐ - nếu có)</label>
              <input 
                type="number" 
                className="input" 
                value={salePrice} 
                onChange={e => setSalePrice(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label>Danh mục</label>
              <select 
                className="input" 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Thương hiệu</label>
              <select 
                className="input" 
                value={brandId} 
                onChange={e => setBrandId(e.target.value)}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Link ảnh sản phẩm chính</label>
            <input 
              type="text" 
              className="input" 
              placeholder="https://example.com/image.png" 
              value={imageUrl} 
              onChange={e => setImageUrl(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <label>Mô tả chi tiết sản phẩm (Hỗ trợ HTML)</label>
            <textarea 
              className="input" 
              rows={4} 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Nhập thông tin mô tả chi tiết của sản phẩm..."
            />
          </div>

          <div className="input-group">
            <div className="flex justify-between items-center mb-xs">
              <label className="font-bold">Thông số kỹ thuật</label>
              <button 
                type="button" 
                onClick={handleAddSpec}
                className="btn btn-ghost btn-sm text-accent"
                style={{ padding: '4px 8px' }}
              >
                <MdOutlineAdd size={16} /> Thêm cấu hình
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
              {specs.length === 0 ? (
                <span className="text-xs text-muted text-center py-sm">Chưa có thông số nào được tạo.</span>
              ) : (
                specs.map((item, index) => (
                  <div key={index} className="flex gap-sm items-center">
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Tên thông số (CPU, RAM...)" 
                      value={item.specKey} 
                      onChange={e => handleSpecChange(index, 'specKey', e.target.value)} 
                      style={{ padding: '8px 12px' }}
                    />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Giá trị" 
                      value={item.specValue} 
                      onChange={e => handleSpecChange(index, 'specValue', e.target.value)} 
                      style={{ padding: '8px 12px' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSpec(index)} 
                      className="btn btn-ghost text-danger p-xs"
                      style={{ padding: 6, minWidth: 'auto' }}
                      title="Xóa dòng"
                    >
                      <MdOutlineDelete size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
