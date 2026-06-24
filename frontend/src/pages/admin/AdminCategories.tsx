import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Category } from '../../types';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [parentId, setParentId] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/categories/all');
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      toast('Lỗi khi tải danh sách danh mục', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setIcon('');
    setParentId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon || '');
    setParentId(category.parentId ? category.parentId.toString() : '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Thao tác này có thể ảnh hưởng đến sản phẩm thuộc danh mục.')) {
      try {
        const { data } = await api.delete(`/admin/categories/${id}`);
        if (data.success) {
          toast('Xóa danh mục thành công!', 'success');
          fetchCategories();
        }
      } catch (error: any) {
        toast(error.response?.data?.message || 'Lỗi khi xóa danh mục. Vui lòng kiểm tra xem danh mục này có chứa danh mục con hay không.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast('Vui lòng nhập tên danh mục', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        icon: icon || null,
        parentId: parentId ? parseInt(parentId) : null
      };

      if (editingCategory) {
        const { data } = await api.put(`/admin/categories/${editingCategory.id}`, payload);
        if (data.success) {
          toast('Cập nhật danh mục thành công!', 'success');
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const { data } = await api.post('/admin/categories', payload);
        if (data.success) {
          toast('Tạo danh mục mới thành công!', 'success');
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch (error: any) {
      toast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter possible parent categories (cannot be the category itself when editing)
  const availableParents = categories.filter(c => !c.parentId && (!editingCategory || c.id !== editingCategory.id));

  return (
    <div>
      <div className="admin-header">
        <h1 className="text-lg font-bold">Quản lý danh mục</h1>
        <Button onClick={handleOpenAdd} icon><MdAdd size={20} /> Thêm danh mục mới</Button>
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
                  <th>Icon</th>
                  <th>Tên danh mục</th>
                  <th>Đường dẫn thân thiện (Slug)</th>
                  <th>Danh mục cha</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-lg text-muted">Chưa có danh mục nào được tạo</td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id}>
                      <td>{cat.id}</td>
                      <td style={{ fontSize: '1.25rem' }}>{cat.icon || '-'}</td>
                      <td className="font-bold">{cat.name}</td>
                      <td><code>{cat.slug}</code></td>
                      <td>{cat.parent?.name || <span className="text-muted">Gốc (Parent)</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex justify-end gap-xs">
                          <button onClick={() => handleOpenEdit(cat)} className="btn btn-ghost btn-icon" title="Chỉnh sửa"><MdEdit size={18} /></button>
                          <button onClick={() => handleDelete(cat.id)} className="btn btn-ghost btn-icon text-danger" title="Xóa"><MdDelete size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} isLoading={submitting}>Lưu lại</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="input-group">
            <label>Tên danh mục *</label>
            <input 
              type="text" 
              className="input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Ví dụ: Laptop Gaming, Bàn phím cơ..."
              required 
            />
          </div>

          <div className="input-group">
            <label>Icon hiển thị (Emoji)</label>
            <input 
              type="text" 
              className="input" 
              value={icon} 
              onChange={e => setIcon(e.target.value)} 
              placeholder="Ví dụ: 🖥️, 💻, ⌨️, 🖱️"
            />
          </div>

          <div className="input-group">
            <label>Danh mục cha (Bỏ trống nếu là danh mục gốc)</label>
            <select 
              className="input" 
              value={parentId} 
              onChange={e => setParentId(e.target.value)}
            >
              <option value="">Không có (Là danh mục gốc)</option>
              {availableParents.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
