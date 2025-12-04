const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { protect } = require('../middleware/auth');

// All game routes require authentication
router.use(protect);

// @route   GET /api/game/station
// @desc    Get user's station
// @access  Private
router.get('/station', gameController.getStation);

// @route   POST /api/game/build
// @desc    Build a building on the station
// @access  Private
router.post('/build', gameController.buildBuilding);

// @route   POST /api/game/research
// @desc    Research a technology
// @access  Private
router.post('/research', gameController.researchTechnology);

module.exports = router;
