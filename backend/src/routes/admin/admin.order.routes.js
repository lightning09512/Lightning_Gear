const router = require('express').Router();
const { getAllOrders, getOrderDetail, updateOrderStatus } = require('../../controllers/adminOrderController');
const { verifyToken, isAdmin } = require('../../middlewares/authMiddleware');

router.use(verifyToken, isAdmin);
router.get('/', getAllOrders);
router.get('/:id', getOrderDetail);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
