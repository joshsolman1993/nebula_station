const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const { protect } = require('../middleware/auth');

// Apply auth middleware
router.use(protect);

// @route   POST /api/quests/claim
// @desc    Claim current quest reward
// @access  Private
router.post('/claim', questController.claimQuest);

// @route   GET /api/quests/status
// @desc    Get current quest status
// @access  Private
router.get('/status', questController.getQuestStatus);

module.exports = router;
