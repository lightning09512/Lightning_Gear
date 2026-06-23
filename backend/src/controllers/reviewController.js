const { Op } = require('sequelize');
const { Review, User, Product, Order, OrderItem } = require('../models');

/**
 * POST /api/reviews — Create review (only after delivered order)
 */
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn sản phẩm và đánh giá sao' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Đánh giá phải từ 1 đến 5 sao' });
    }

    // Check if user has purchased and received the product
    const hasPurchased = await Order.findOne({
      where: { userId: req.user.id, status: 'delivered' },
      include: [{
        model: OrderItem,
        as: 'items',
        where: { productId },
      }],
    });

    if (!hasPurchased) {
      return res.status(403).json({ success: false, message: 'Bạn chỉ có thể đánh giá sản phẩm đã mua và nhận hàng thành công' });
    }

    // Check existing review
    const existingReview = await Review.findOne({
      where: { userId: req.user.id, productId },
    });

    if (existingReview) {
      return res.status(409).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    const review = await Review.create({
      userId: req.user.id,
      productId,
      rating: parseInt(rating),
      comment: comment || null,
    });

    const fullReview = await Review.findByPk(review.id, {
      include: [{ model: User, attributes: ['id', 'username'] }],
    });

    res.status(201).json({ success: true, message: 'Đánh giá thành công', data: fullReview });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/reviews/product/:productId — Reviews for a product
 */
const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Review.findAndCountAll({
      where: { productId: req.params.productId },
      include: [{ model: User, attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        reviews: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { createReview, getProductReviews };
