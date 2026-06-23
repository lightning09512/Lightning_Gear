const router = require('express').Router();
const { getAllCategories, getAllCategoriesFlat, createCategory, updateCategory, deleteCategory } = require('../../controllers/categoryController');
const { verifyToken, isAdmin } = require('../../middlewares/authMiddleware');

router.get('/', getAllCategories); // Public for frontend filter
router.get('/all', getAllCategoriesFlat);
router.post('/', verifyToken, isAdmin, createCategory);
router.put('/:id', verifyToken, isAdmin, updateCategory);
router.delete('/:id', verifyToken, isAdmin, deleteCategory);

module.exports = router;
