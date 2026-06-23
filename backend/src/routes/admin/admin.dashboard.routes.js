const router = require('express').Router();
const { getStats, getRevenueChart, getRecentOrders } = require('../../controllers/adminDashboardController');
const { verifyToken, isAdmin } = require('../../middlewares/authMiddleware');

router.use(verifyToken, isAdmin);
router.get('/stats', getStats);
router.get('/revenue', getRevenueChart);
router.get('/recent-orders', getRecentOrders);

module.exports = router;
