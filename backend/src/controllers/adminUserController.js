const { Op } = require('sequelize');
const { User, Order } = require('../models');

/**
 * GET /api/admin/users — List all users
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { role: 'user' };

    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'verifyToken', 'verifyTokenExpiry', 'resetToken', 'resetTokenExpiry'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/admin/users/:id — User detail
 */
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'verifyToken', 'verifyTokenExpiry', 'resetToken', 'resetTokenExpiry'] },
      include: [{
        model: Order,
        order: [['createdAt', 'DESC']],
        limit: 10,
      }],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user detail error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * PATCH /api/admin/users/:id/toggle — Lock/unlock user
 */
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Không thể khoá tài khoản admin' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'Đã mở khoá tài khoản' : 'Đã khoá tài khoản',
      data: { isActive: user.isActive },
    });
  } catch (error) {
    console.error('Toggle user error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getAllUsers, getUserDetail, toggleUserActive };
