const router = require('express').Router();
const { createOrder, getUserOrders, getOrderDetail } = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderDetail);

module.exports = router;
