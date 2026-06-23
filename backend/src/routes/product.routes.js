const router = require('express').Router();
const { getAllProducts, searchProducts, getProductBySlug, getProductsByCategory, getFeaturedProducts } = require('../controllers/productController');

router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/category/:slug', getProductsByCategory);
router.get('/:slug', getProductBySlug);
router.get('/', getAllProducts);

module.exports = router;
