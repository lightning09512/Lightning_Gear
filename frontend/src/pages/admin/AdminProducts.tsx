import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Product, PaginatedResponse } from '../../types';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { MdAdd, MdEdit, MdDelete, MdCheck, MdClose } from 'react-icons/md';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div>
      <div className="admin-header">
        <h1 className="text-lg font-bold">Quản lý sản phẩm</h1>
        <Button icon><MdAdd size={20} /> Thêm sản phẩm mới</Button>
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
                          <div className="text-xs text-muted">{product.Category?.name} | {product.Brand?.name}</div>
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
                            <button className="btn btn-ghost btn-icon" title="Chỉnh sửa"><MdEdit size={18} /></button>
                            <button className="btn btn-ghost btn-icon text-danger" title="Xóa"><MdDelete size={18} /></button>
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
    </div>
  );
};

export default AdminProducts;
