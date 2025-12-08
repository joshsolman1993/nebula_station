const express = require('express');
const router = express.Router();
const combatController = require('../controllers/combatController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// @route   POST /api/combat/attack
// @desc    Attack an enemy
// @access  Private
router.post('/attack', combatController.attackEnemy);

// @route   POST /api/combat/repair
// @desc    Repair a ship
// @access  Private
router.post('/repair', combatController.repairShip);

// @route   GET /api/combat/enemies
// @desc    Get available enemies
// @access  Private
router.get('/enemies', combatController.getAvailableEnemies);

module.exports = router;
