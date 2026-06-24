const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User } = require('../models');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/emailService');
require('dotenv').config();

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    }

    // Check existing email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email đã được đăng ký' });
    }

    // Generate verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      phone: phone || null,
      address: address || null,
      verifyToken,
      verifyTokenExpiry,
      isVerified: true,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user, verifyToken);
    } catch (emailError) {
      console.warn('⚠️ Could not send verification email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.',
      data: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/auth/verify-email?token=xxx
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
    }

    const user = await User.findOne({
      where: {
        verifyToken: token,
        verifyTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    user.isVerified = true;
    user.verifyToken = null;
    user.verifyTokenExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Email đã được xác nhận thành công! Bạn có thể đăng nhập.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Tài khoản chưa được xác nhận email. Vui lòng kiểm tra email.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khoá' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: user.toSafeJSON(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * POST /api/auth/admin/login
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ where: { email, role: 'admin' } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không đúng' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khoá' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không đúng' });
    }

    const token = jwt.sign(
      { id: user.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập admin thành công',
      data: {
        token,
        user: user.toSafeJSON(),
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    try {
      await sendResetPasswordEmail(user, resetToken);
    } catch (emailError) {
      console.warn('⚠️ Could not send reset email:', emailError.message);
    }

    res.json({ success: true, message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    user.password = password; // Will be hashed by beforeUpdate hook
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ success: true, message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/auth/me — Get current user
 */
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
  getMe,
};
