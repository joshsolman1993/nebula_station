const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    getStats,
    getUsers,
    giveResources,
    resetUser
} = require('../controllers/adminController');

// Protect all routes with auth and admin middleware
router.use(protect);
router.use(adminMiddleware);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/give-resources', giveResources);
router.post('/reset-user', resetUser);

module.exports = router;
