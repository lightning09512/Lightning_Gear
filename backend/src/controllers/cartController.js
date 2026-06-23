const { CartItem, Product, ProductImage } = require('../models');

/**
 * GET /api/cart — Get user's cart
 */
const getCart = async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock', 'isActive'],
        include: [{ model: ProductImage, as: 'images', where: { isPrimary: true }, required: false, attributes: ['imageUrl'] }],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * POST /api/cart — Add item to cart
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin sản phẩm' });
    }

    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Check if already in cart
    let cartItem = await CartItem.findOne({
      where: { userId: req.user.id, productId },
    });

    if (cartItem) {
      cartItem.quantity += parseInt(quantity);
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Chỉ còn ${product.stock} sản phẩm trong kho` });
      }
      await cartItem.save();
    } else {
      if (parseInt(quantity) > product.stock) {
        return res.status(400).json({ success: false, message: `Chỉ còn ${product.stock} sản phẩm trong kho` });
      }
      cartItem = await CartItem.create({
        userId: req.user.id,
        productId,
        quantity: parseInt(quantity),
      });
    }

    res.json({ success: true, message: 'Đã thêm vào giỏ hàng', data: cartItem });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * PUT /api/cart/:id — Update cart item quantity
 */
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Product, attributes: ['stock'] }],
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
    }

    if (quantity > item.Product.stock) {
      return res.status(400).json({ success: false, message: `Chỉ còn ${item.Product.stock} sản phẩm trong kho` });
    }

    item.quantity = parseInt(quantity);
    await item.save();

    res.json({ success: true, message: 'Đã cập nhật giỏ hàng', data: item });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * DELETE /api/cart/:id — Remove item from cart
 */
const removeCartItem = async (req, res) => {
  try {
    const item = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không có trong giỏ hàng' });
    }

    await item.destroy();
    res.json({ success: true, message: 'Đã xoá khỏi giỏ hàng' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * POST /api/cart/sync — Sync localStorage cart to DB on login
 */
const syncCart = async (req, res) => {
  try {
    const { items } = req.body; // Array of { productId, quantity }

    if (!items || !Array.isArray(items)) {
      return res.json({ success: true, message: 'Không có gì để đồng bộ' });
    }

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product || !product.isActive) continue;

      let existing = await CartItem.findOne({
        where: { userId: req.user.id, productId: item.productId },
      });

      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, product.stock);
        await existing.save();
      } else {
        await CartItem.create({
          userId: req.user.id,
          productId: item.productId,
          quantity: Math.min(item.quantity, product.stock),
        });
      }
    }

    const cart = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'slug', 'price', 'salePrice', 'stock'],
        include: [{ model: ProductImage, as: 'images', where: { isPrimary: true }, required: false, attributes: ['imageUrl'] }],
      }],
    });

    res.json({ success: true, message: 'Đồng bộ giỏ hàng thành công', data: cart });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, syncCart };
