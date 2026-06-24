const { Op } = require('sequelize');
const { Product, ProductImage, ProductSpec, Category, Brand, Review } = require('../models');
const sequelize = require('../config/database');

/**
 * GET /api/products — List products with filters, sort, pagination
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      categoryId,
      brandId,
      brands,
      priceMin,
      minPrice,
      priceMax,
      maxPrice,
      search,
      q,
      sort = 'newest',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { isActive: true };

    // Filters
    if (categoryId) {
      if (Array.isArray(categoryId)) {
        where.categoryId = { [Op.in]: categoryId };
      } else {
        where.categoryId = categoryId;
      }
    }

    // Brand filter (support multiple brands comma-separated or brandId)
    const rawBrands = brands || brandId;
    if (rawBrands) {
      if (typeof rawBrands === 'string') {
        const brandIds = rawBrands.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        if (brandIds.length > 0) {
          where.brandId = { [Op.in]: brandIds };
        }
      } else if (Array.isArray(rawBrands)) {
        where.brandId = { [Op.in]: rawBrands };
      } else {
        where.brandId = rawBrands;
      }
    }

    // Price range filters
    const finalMinPrice = parseInt(priceMin || minPrice);
    const finalMaxPrice = parseInt(priceMax || maxPrice);
    if (!isNaN(finalMinPrice) || !isNaN(finalMaxPrice)) {
      where.price = {};
      if (!isNaN(finalMinPrice)) where.price[Op.gte] = finalMinPrice;
      if (!isNaN(finalMaxPrice)) where.price[Op.lte] = finalMaxPrice;
    }

    // Search query
    const finalSearch = search || q;
    if (finalSearch) {
      where[Op.or] = [
        { name: { [Op.like]: `%${finalSearch}%` } },
        { description: { [Op.like]: `%${finalSearch}%` } },
      ];
    }

    // Sort order
    let order;
    switch (sort) {
      case 'price_asc':
      case 'price:ASC':
        order = [['price', 'ASC']];
        break;
      case 'price_desc':
      case 'price:DESC':
        order = [['price', 'DESC']];
        break;
      case 'best_selling':
        order = [['id', 'DESC']];
        break;
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'createdAt:DESC':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
        { model: Brand, attributes: ['id', 'name'] },
      ],
      order,
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        products: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/products/search?q=xxx — Realtime search
 */
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const products = await Product.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [
        { model: ProductImage, as: 'images', where: { isPrimary: true }, required: false, attributes: ['imageUrl'] },
      ],
      attributes: ['id', 'name', 'slug', 'price', 'salePrice'],
      limit: 8,
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/products/:slug — Single product detail
 */
const getProductBySlug = async (req, res) => {
  try {
    const param = req.params.slug;
    const isNumeric = /^\d+$/.test(param);
    const queryWhere = isNumeric 
      ? { [Op.or]: [{ id: parseInt(param) }, { slug: param }], isActive: true }
      : { slug: param, isActive: true };

    const product = await Product.findOne({
      where: queryWhere,
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductSpec, as: 'specs' },
        { model: Category, attributes: ['id', 'name', 'slug'] },
        { model: Brand, attributes: ['id', 'name', 'logo'] },
        {
          model: Review,
          as: 'reviews',
          include: [{ association: 'User', attributes: ['id', 'username'] }],
          order: [['createdAt', 'DESC']],
          limit: 20,
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    // Calculate average rating
    const avgRating = await Review.findOne({
      where: { productId: product.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
      ],
      raw: true,
    });

    const result = product.toJSON();
    result.avgRating = parseFloat(avgRating?.avgRating) || 0;
    result.totalReviews = parseInt(avgRating?.totalReviews) || 0;

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/products/category/:slug — Products by category
 */
const getProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ where: { slug: req.params.slug } });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Danh mục không tồn tại' });
    }

    // Include sub-categories
    const subCategories = await Category.findAll({ where: { parentId: category.id } });
    const categoryIds = [category.id, ...subCategories.map(c => c.id)];

    const {
      page = 1,
      limit = 12,
      brands,
      brandId,
      priceMin,
      minPrice,
      priceMax,
      maxPrice,
      search,
      q,
      sort = 'newest',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { 
      isActive: true, 
      categoryId: { [Op.in]: categoryIds } 
    };

    // Brand filter
    const rawBrands = brands || brandId;
    if (rawBrands) {
      if (typeof rawBrands === 'string') {
        const brandIds = rawBrands.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
        if (brandIds.length > 0) {
          where.brandId = { [Op.in]: brandIds };
        }
      } else if (Array.isArray(rawBrands)) {
        where.brandId = { [Op.in]: rawBrands };
      } else {
        where.brandId = rawBrands;
      }
    }

    // Price range filters
    const finalMinPrice = parseInt(priceMin || minPrice);
    const finalMaxPrice = parseInt(priceMax || maxPrice);
    if (!isNaN(finalMinPrice) || !isNaN(finalMaxPrice)) {
      where.price = {};
      if (!isNaN(finalMinPrice)) where.price[Op.gte] = finalMinPrice;
      if (!isNaN(finalMaxPrice)) where.price[Op.lte] = finalMaxPrice;
    }

    // Search query
    const finalSearch = search || q;
    if (finalSearch) {
      where[Op.or] = [
        { name: { [Op.like]: `%${finalSearch}%` } },
        { description: { [Op.like]: `%${finalSearch}%` } },
      ];
    }

    // Sort order
    let order;
    switch (sort) {
      case 'price_asc':
      case 'price:ASC':
        order = [['price', 'ASC']];
        break;
      case 'price_desc':
      case 'price:DESC':
        order = [['price', 'DESC']];
        break;
      case 'best_selling':
        order = [['id', 'DESC']];
        break;
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'createdAt:DESC':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
        { model: Brand, attributes: ['id', 'name'] },
      ],
      order,
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        category,
        products: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/products/featured — Featured products for homepage
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const getProductsByCategorySlug = async (slug, limit = 8) => {
      const category = await Category.findOne({ where: { slug } });
      if (!category) return [];
      
      const subCategories = await Category.findAll({ where: { parentId: category.id } });
      const categoryIds = [category.id, ...subCategories.map(c => c.id)];
      
      return Product.findAll({
        where: { isActive: true, categoryId: { [Op.in]: categoryIds } },
        include: [
          { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary'] },
          { model: Category, attributes: ['id', 'name', 'slug'] },
          { model: Brand, attributes: ['id', 'name'] },
        ],
        order: [['createdAt', 'DESC']],
        limit,
      });
    };

    const [pcGaming, linhKien, manHinh, laptop, categories] = await Promise.all([
      getProductsByCategorySlug('pc-gaming', 8),
      getProductsByCategorySlug('linh-kien', 8),
      getProductsByCategorySlug('man-hinh', 8),
      getProductsByCategorySlug('laptop', 8),
      Category.findAll({
        where: { parentId: null },
        include: [{ model: Category, as: 'children' }],
        order: [['name', 'ASC']],
      }),
    ]);

    res.json({
      success: true,
      data: { pcGaming, linhKien, manHinh, laptop, categories },
    });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// ===== ADMIN PRODUCT CONTROLLERS =====

/**
 * POST /api/admin/products — Create product
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, salePrice, stock, categoryId, brandId, specs, imageUrl } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Tên và giá sản phẩm là bắt buộc' });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now();

    const product = await Product.create({
      name,
      slug,
      description: description || '',
      price: parseInt(price),
      salePrice: salePrice ? parseInt(salePrice) : null,
      stock: parseInt(stock) || 0,
      categoryId: categoryId || null,
      brandId: brandId || null,
    });

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file, index) => ({
        productId: product.id,
        imageUrl: `/uploads/products/${file.filename}`,
        isPrimary: index === 0,
      }));
      await ProductImage.bulkCreate(imageRecords);
    } else if (imageUrl) {
      await ProductImage.create({
        productId: product.id,
        imageUrl,
        isPrimary: true,
      });
    }

    // Handle specs
    if (specs) {
      const parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      if (Array.isArray(parsedSpecs) && parsedSpecs.length > 0) {
        const specRecords = parsedSpecs.map(s => ({
          productId: product.id,
          specKey: s.key || s.specKey,
          specValue: s.value || s.specValue,
        }));
        await ProductSpec.bulkCreate(specRecords);
      }
    }

    // Fetch complete product
    const fullProduct = await Product.findByPk(product.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductSpec, as: 'specs' },
        { model: Category },
        { model: Brand },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: fullProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * PUT /api/admin/products/:id — Update product
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    const { name, description, price, salePrice, stock, categoryId, brandId, specs, imageUrl } = req.body;

    // Update slug if name changed
    let slug = product.slug;
    if (name && name !== product.name) {
      slug = name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now();
    }

    await product.update({
      name: name || product.name,
      slug,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? parseInt(price) : product.price,
      salePrice: salePrice !== undefined ? (salePrice ? parseInt(salePrice) : null) : product.salePrice,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      brandId: brandId !== undefined ? brandId : product.brandId,
    });

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file) => ({
        productId: product.id,
        imageUrl: `/uploads/products/${file.filename}`,
        isPrimary: false,
      }));
      await ProductImage.bulkCreate(imageRecords);
    } else if (imageUrl) {
      const primaryImage = await ProductImage.findOne({ where: { productId: product.id, isPrimary: true } });
      if (primaryImage) {
        await primaryImage.update({ imageUrl });
      } else {
        await ProductImage.create({
          productId: product.id,
          imageUrl,
          isPrimary: true,
        });
      }
    }

    // Handle specs update
    if (specs) {
      const parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
      // Replace all specs
      await ProductSpec.destroy({ where: { productId: product.id } });
      if (Array.isArray(parsedSpecs) && parsedSpecs.length > 0) {
        const specRecords = parsedSpecs.map(s => ({
          productId: product.id,
          specKey: s.key || s.specKey,
          specValue: s.value || s.specValue,
        }));
        await ProductSpec.bulkCreate(specRecords);
      }
    }

    const fullProduct = await Product.findByPk(product.id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductSpec, as: 'specs' },
        { model: Category },
        { model: Brand },
      ],
    });

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: fullProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * DELETE /api/admin/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    await ProductImage.destroy({ where: { productId: product.id } });
    await ProductSpec.destroy({ where: { productId: product.id } });
    await product.destroy();

    res.json({ success: true, message: 'Xoá sản phẩm thành công' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * PATCH /api/admin/products/:id/toggle — Toggle isActive
 */
const toggleProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      message: product.isActive ? 'Đã bật hiển thị sản phẩm' : 'Đã ẩn sản phẩm',
      data: { isActive: product.isActive },
    });
  } catch (error) {
    console.error('Toggle product error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * GET /api/admin/products — Admin product list (includes inactive)
 */
const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, categoryId, brandId } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary'] },
        { model: Category, attributes: ['id', 'name', 'slug'] },
        { model: Brand, attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        products: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * DELETE /api/admin/products/:productId/images/:imageId
 */
const deleteProductImage = async (req, res) => {
  try {
    const image = await ProductImage.findOne({
      where: { id: req.params.imageId, productId: req.params.productId },
    });
    if (!image) {
      return res.status(404).json({ success: false, message: 'Ảnh không tồn tại' });
    }
    await image.destroy();
    res.json({ success: true, message: 'Xoá ảnh thành công' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

module.exports = {
  getAllProducts,
  searchProducts,
  getProductBySlug,
  getProductsByCategory,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
  getAdminProducts,
  deleteProductImage,
};
