const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeCartItem, syncCart } = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken); // All cart routes require auth
router.get('/', getCart);
router.post('/', addToCart);
router.post('/sync', syncCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeCartItem);

module.exports = router;
