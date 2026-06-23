const { Op } = require('sequelize');
const { Order, OrderItem, Product, ProductImage, User } = require('../models');
const { sendOrderStatusEmail } = require('../services/emailService');
const { emitOrderStatusUpdate } = require('../services/socketService');

/**
 * GET /api/admin/orders — All orders with filters
 */
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { id: parseInt(search) || 0 },
      ];
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            attributes: ['id', 'name'],
            include: [{ model: ProductImage, as: 'images', where: { isPrimary: true }, required: false, attributes: ['imageUrl'] }],
          }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        orders: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/admin/orders/:id — Order detail
 */
const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'phone', 'address'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{
            model: Product,
            include: [{ model: ProductImage, as: 'images', where: { isPrimary: true }, required: false }],
          }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Admin get order detail error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * PATCH /api/admin/orders/:id/status — Update order status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username', 'email'] }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Emit Socket.io event to user
    try {
      emitOrderStatusUpdate(order.userId, order.id, status);
    } catch (e) {
      console.warn('Socket emit failed:', e.message);
    }

    // Send email for confirmed status
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      sendOrderStatusEmail(order.User, order).catch(err =>
        console.warn('⚠️ Could not send status email:', err.message)
      );
    }

    // If cancelled, restore stock
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const items = await OrderItem.findAll({ where: { orderId: order.id } });
      for (const item of items) {
        await Product.increment('stock', { by: item.quantity, where: { id: item.productId } });
      }
    }

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng thành "${status}"`,
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getAllOrders, getOrderDetail, updateOrderStatus };
