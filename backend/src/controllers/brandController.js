const { Brand } = require('../models');

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, logo } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Tên thương hiệu là bắt buộc' });
    }
    const existing = await Brand.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Thương hiệu đã tồn tại' });
    }
    const brand = await Brand.create({ name, logo: logo || null });
    res.status(201).json({ success: true, message: 'Tạo thương hiệu thành công', data: brand });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Thương hiệu không tồn tại' });
    }
    const { name, logo } = req.body;
    await brand.update({ name: name || brand.name, logo: logo !== undefined ? logo : brand.logo });
    res.json({ success: true, message: 'Cập nhật thương hiệu thành công', data: brand });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Thương hiệu không tồn tại' });
    }
    await brand.destroy();
    res.json({ success: true, message: 'Xoá thương hiệu thành công' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = { getAllBrands, createBrand, updateBrand, deleteBrand };
