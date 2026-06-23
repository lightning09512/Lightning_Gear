const router = require('express').Router();
const { createReview, getProductReviews } = require('../controllers/reviewController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/product/:productId', getProductReviews);
router.post('/', verifyToken, createReview);

module.exports = router;
