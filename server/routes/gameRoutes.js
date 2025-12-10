const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getStation,
    buildBuilding,
    getAllianceLeaderboard,
    getLeaderboard,
    getGlobalEvents,
    researchTechnology,
    equipItem,
    unequipItem,
    learnTalent
} = require('../controllers/gameController');

// All game routes require authentication
router.use(protect);

// @route   GET /api/game/station
// @desc    Get user's station
// @access  Private
router.get('/station', getStation);

// @route   GET /api/game/events
// @desc    Get global events
// @access  Private
router.get('/events', getGlobalEvents);

// @route   POST /api/game/build
// @desc    Build a building on the station
// @access  Private
router.post('/build', buildBuilding);

// @route   POST /api/game/research
// @desc    Research a technology
// @access  Private
router.post('/research', researchTechnology);

// @route   POST /api/game/equip
// @desc    Equip an item
// @access  Private
router.post('/equip', equipItem);

// @route   POST /api/game/unequip
// @desc    Unequip an item
// @access  Private
router.post('/unequip', unequipItem);

// @route   POST /api/game/talents/learn
// @desc    Learn a talent
// @access  Private
router.post('/talents/learn', learnTalent);

module.exports = router;
