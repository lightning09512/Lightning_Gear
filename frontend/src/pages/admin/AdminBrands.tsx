import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Brand } from '../../types';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const AdminBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/brands');
      if (data.success) {
        setBrands(data.data || []);
      }
    } catch (error) {
      toast('Lỗi khi tải danh sách thương hiệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setName('');
    setLogo('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setLogo(brand.logo || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này? Thao tác này có thể ảnh hưởng đến sản phẩm thuộc thương hiệu.')) {
      try {
        const { data } = await api.delete(`/admin/brands/${id}`);
        if (data.success) {
          toast('Xóa thương hiệu thành công!', 'success');
          fetchBrands();
        }
      } catch (error: any) {
        toast(error.response?.data?.message || 'Lỗi khi xóa thương hiệu', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast('Vui lòng nhập tên thương hiệu', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        logo: logo || null
      };

      if (editingBrand) {
        const { data } = await api.put(`/admin/brands/${editingBrand.id}`, payload);
        if (data.success) {
          toast('Cập nhật thương hiệu thành công!', 'success');
          setIsModalOpen(false);
          fetchBrands();
        }
      } else {
        const { data } = await api.post('/admin/brands', payload);
        if (data.success) {
          toast('Tạo thương hiệu mới thành công!', 'success');
          setIsModalOpen(false);
          fetchBrands();
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
        <h1 className="text-lg font-bold">Quản lý thương hiệu</h1>
        <Button onClick={handleOpenAdd} icon><MdAdd size={20} /> Thêm thương hiệu mới</Button>
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
                  <th>Logo</th>
                  <th>Tên thương hiệu</th>
                  <th>Đường dẫn thân thiện (Slug)</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-lg text-muted">Chưa có thương hiệu nào được tạo</td>
                  </tr>
                ) : (
                  brands.map(brand => {
                    const slug = brand.name
                      .toLowerCase()
                      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '');

                    return (
                      <tr key={brand.id}>
                        <td>{brand.id}</td>
                        <td>
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} style={{ height: 30, objectFit: 'contain', maxWidth: 80 }} />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="font-bold">{brand.name}</td>
                        <td><code>{slug}</code></td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex justify-end gap-xs">
                            <button onClick={() => handleOpenEdit(brand)} className="btn btn-ghost btn-icon" title="Chỉnh sửa"><MdEdit size={18} /></button>
                            <button onClick={() => handleDelete(brand.id)} className="btn btn-ghost btn-icon text-danger" title="Xóa"><MdDelete size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Brand Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thạo thương hiệu mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} isLoading={submitting}>Lưu lại</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="input-group">
            <label>Tên thương hiệu *</label>
            <input 
              type="text" 
              className="input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Ví dụ: NVIDIA, ASUS, Logitech..."
              required 
            />
          </div>

          <div className="input-group">
            <label>Link logo thương hiệu</label>
            <input 
              type="text" 
              className="input" 
              value={logo} 
              onChange={e => setLogo(e.target.value)} 
              placeholder="https://example.com/logo.png"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminBrands;
