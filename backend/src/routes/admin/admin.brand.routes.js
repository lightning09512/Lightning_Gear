const router = require('express').Router();
const { getAllBrands, createBrand, updateBrand, deleteBrand } = require('../../controllers/brandController');
const { verifyToken, isAdmin } = require('../../middlewares/authMiddleware');

router.get('/', getAllBrands); // Public for frontend filter
router.post('/', verifyToken, isAdmin, createBrand);
router.put('/:id', verifyToken, isAdmin, updateBrand);
router.delete('/:id', verifyToken, isAdmin, deleteBrand);

module.exports = router;
