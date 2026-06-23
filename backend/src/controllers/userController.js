const bcrypt = require('bcryptjs');
const { User } = require('../models');

/**
 * GET /api/user/profile — Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    res.json({ success: true, data: req.user.toSafeJSON() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * PUT /api/user/profile — Update profile
 */
const updateProfile = async (req, res) => {
  try {
    const { username, phone, address } = req.body;

    await req.user.update({
      username: username || req.user.username,
      phone: phone !== undefined ? phone : req.user.phone,
      address: address !== undefined ? address : req.user.address,
    });

    res.json({ success: true, message: 'Cập nhật thông tin thành công', data: req.user.toSafeJSON() });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * PUT /api/user/change-password — Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    req.user.password = newPassword; // Will be hashed by beforeUpdate hook
    await req.user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
