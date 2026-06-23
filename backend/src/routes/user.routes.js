const router = require('express').Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
