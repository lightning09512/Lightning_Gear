const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Order, OrderItem, Product, ProductImage, CartItem, User } = require('../models');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const { emitNewOrderNotification } = require('../services/socketService');

/**
 * POST /api/orders — Create order from cart
 */
const createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { shippingAddress, paymentMethod = 'cod', note } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin giao hàng' });
    }

    // Get cart items
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
      transaction: t,
    });

    if (cartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      if (!item.Product || !item.Product.isActive) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Sản phẩm "${item.Product?.name || 'unknown'}" không còn khả dụng` });
      }
      if (item.quantity > item.Product.stock) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Sản phẩm "${item.Product.name}" chỉ còn ${item.Product.stock} trong kho` });
      }

      const priceAtOrder = item.Product.salePrice || item.Product.price;
      totalAmount += priceAtOrder * item.quantity;

      orderItemsData.push({
        productId: item.Product.id,
        quantity: item.quantity,
        priceAtOrder,
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      status: 'pending',
      paymentMethod,
      shippingAddress,
      note: note || null,
    }, { transaction: t });

    // Create order items
    const orderItems = await OrderItem.bulkCreate(
      orderItemsData.map(item => ({ ...item, orderId: order.id })),
      { transaction: t }
    );

    // Reduce stock
    for (const item of cartItems) {
      await Product.update(
        { stock: sequelize.literal(`stock - ${item.quantity}`) },
        { where: { id: item.Product.id }, transaction: t }
      );
    }

    // Clear cart
    await CartItem.destroy({ where: { userId: req.user.id }, transaction: t });

    await t.commit();

    // Fetch complete order with product details for email
    const fullOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, attributes: ['id', 'name'] }],
      }],
    });

    // Send order confirmation email (non-blocking)
    sendOrderConfirmationEmail(req.user, fullOrder, fullOrder.items).catch(err =>
      console.warn('⚠️ Could not send order confirmation email:', err.message)
    );

    // Notify admin via Socket.io (non-blocking)
    try { emitNewOrderNotification(order); } catch (e) { /* ignore */ }

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: fullOrder,
    });
  } catch (error) {
    await t.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/orders — User's order history
 */
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          attributes: ['id', 'name', 'slug'],
          include: [{ model: ProductImage, as: 'images', where: { isPrimary: true }, required: false, attributes: ['imageUrl'] }],
        }],
      }],
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
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/orders/:id — User's single order detail
 */
const getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          include: [{ model: ProductImage, as: 'images', where: { isPrimary: true }, required: false, attributes: ['imageUrl'] }],
        }],
      }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { createOrder, getUserOrders, getOrderDetail };
