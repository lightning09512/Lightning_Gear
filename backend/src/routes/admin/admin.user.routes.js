const router = require('express').Router();
const { getAllUsers, getUserDetail, toggleUserActive } = require('../../controllers/adminUserController');
const { verifyToken, isAdmin } = require('../../middlewares/authMiddleware');

router.use(verifyToken, isAdmin);
router.get('/', getAllUsers);
router.get('/:id', getUserDetail);
router.patch('/:id/toggle', toggleUserActive);

module.exports = router;
