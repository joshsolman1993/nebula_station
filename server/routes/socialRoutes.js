const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');

// @route   GET /api/social/leaderboard
// @desc    Get leaderboard (top players)
// @access  Public
router.get('/leaderboard', socialController.getLeaderboard);

// @route   GET /api/social/profile/:username
// @desc    Get player profile by username
// @access  Public
router.get('/profile/:username', socialController.getProfile);

module.exports = router;
