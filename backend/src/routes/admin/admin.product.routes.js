const router = require('express').Router();
const { createProduct, updateProduct, deleteProduct, toggleProduct, getAdminProducts, deleteProductImage } = require('../../controllers/productController');
const { verifyToken, isAdmin } = require('../../middlewares/authMiddleware');
const upload = require('../../middlewares/upload');

router.use(verifyToken, isAdmin);
router.get('/', getAdminProducts);
router.post('/', upload.array('images', 10), createProduct);
router.put('/:id', upload.array('images', 10), updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/toggle', toggleProduct);
router.delete('/:productId/images/:imageId', deleteProductImage);

module.exports = router;
