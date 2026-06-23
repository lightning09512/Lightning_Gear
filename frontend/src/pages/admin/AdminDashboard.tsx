import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DashboardStats } from '../../types';
import { formatPrice } from '../../utils/formatPrice';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MdAttachMoney, MdShoppingCart, MdInventory, MdPeople } from 'react-icons/md';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Fetch stats error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!stats) return null;

  return (
    <div>
      <div className="admin-header">
        <h1 className="text-lg font-bold">Tổng quan</h1>
      </div>

      <div className="stats-grid mb-xl">
        <div className="stat-card" style={{ '--card-accent': 'rgba(0, 212, 255, 0.08)' } as React.CSSProperties}>
          <div className="flex items-center gap-sm mb-xs">
            <MdAttachMoney size={24} className="text-accent" />
            <span className="stat-label">Tổng doanh thu</span>
          </div>
          <div className="stat-value text-accent">{formatPrice(stats.totalRevenue)}</div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'rgba(0, 255, 136, 0.08)' } as React.CSSProperties}>
          <div className="flex items-center gap-sm mb-xs">
            <MdShoppingCart size={24} className="text-success" />
            <span className="stat-label">Đơn hàng hôm nay</span>
          </div>
          <div className="stat-value">{stats.todayOrders}</div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'rgba(123, 47, 247, 0.08)' } as React.CSSProperties}>
          <div className="flex items-center gap-sm mb-xs">
            <MdInventory size={24} className="text-info" style={{ color: 'var(--accent-secondary)' }} />
            <span className="stat-label">Tổng sản phẩm</span>
          </div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'rgba(255, 215, 0, 0.08)' } as React.CSSProperties}>
          <div className="flex items-center gap-sm mb-xs">
            <MdPeople size={24} className="text-warning" />
            <span className="stat-label">Khách hàng mới (Hôm nay)</span>
          </div>
          <div className="stat-value">{stats.newUsersToday}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="filter-title border-bottom pb-sm mb-md">Thống kê trạng thái đơn hàng</h3>
          <div className="flex flex-col gap-sm">
            {stats.ordersByStatus.length === 0 && <p className="text-muted text-sm">Chưa có dữ liệu</p>}
            {stats.ordersByStatus.map(s => (
              <div key={s.status} className="flex justify-between items-center p-sm bg-secondary border-radius-sm">
                <span className="font-bold text-uppercase">{s.status}</span>
                <span className="badge badge-primary">{s.count} đơn</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
