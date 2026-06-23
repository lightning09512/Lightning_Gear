const { Category } = require('../models');

/**
 * GET /api/admin/categories — All categories
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Category, as: 'children' }],
      where: { parentId: null },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/admin/categories/all — Flat list of all categories
 */
const getAllCategoriesFlat = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Category, as: 'parent', attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories flat error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * POST /api/admin/categories — Create category
 */
const createCategory = async (req, res) => {
  try {
    const { name, icon, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên danh mục là bắt buộc' });
    }

    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check unique slug
    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Danh mục đã tồn tại' });
    }

    const category = await Category.create({
      name,
      slug,
      icon: icon || null,
      parentId: parentId || null,
    });

    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * PUT /api/admin/categories/:id — Update category
 */
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }

    const { name, icon, parentId } = req.body;

    let slug = category.slug;
    if (name && name !== category.name) {
      slug = name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    await category.update({
      name: name || category.name,
      slug,
      icon: icon !== undefined ? icon : category.icon,
      parentId: parentId !== undefined ? parentId : category.parentId,
    });

    res.json({ success: true, message: 'Cập nhật danh mục thành công', data: category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }

    // Check children
    const children = await Category.count({ where: { parentId: category.id } });
    if (children > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xoá danh mục có danh mục con' });
    }

    await category.destroy();
    res.json({ success: true, message: 'Xoá danh mục thành công' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getAllCategories,
  getAllCategoriesFlat,
  createCategory,
  updateCategory,
  deleteCategory,
};
