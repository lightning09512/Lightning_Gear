const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Order, OrderItem, Product, User } = require('../models');

/**
 * GET /api/admin/dashboard/stats — Overview statistics
 */
const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalRevenue, todayOrders, totalProducts, newUsersToday, ordersByStatus] = await Promise.all([
      Order.sum('totalAmount', { where: { status: { [Op.ne]: 'cancelled' } } }),
      Order.count({ where: { createdAt: { [Op.gte]: today } } }),
      Product.count({ where: { isActive: true } }),
      User.count({ where: { role: 'user', createdAt: { [Op.gte]: today } } }),
      Order.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue || 0,
        todayOrders,
        totalProducts,
        newUsersToday,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/admin/dashboard/revenue — Revenue chart data
 */
const getRevenueChart = async (req, res) => {
  try {
    const { period = 'daily' } = req.query; // daily, weekly, monthly
    let dateFormat, days;

    switch (period) {
      case 'monthly':
        dateFormat = '%Y-%m';
        days = 365;
        break;
      case 'weekly':
        dateFormat = '%Y-%u';
        days = 90;
        break;
      default:
        dateFormat = '%Y-%m-%d';
        days = 30;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenue = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'date'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
      ],
      where: {
        status: { [Op.ne]: 'cancelled' },
        createdAt: { [Op.gte]: startDate },
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat)],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), dateFormat), 'ASC']],
      raw: true,
    });

    res.json({ success: true, data: revenue });
  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/admin/dashboard/recent-orders — Latest orders
 */
const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, attributes: ['id', 'username', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getStats, getRevenueChart, getRecentOrders };
