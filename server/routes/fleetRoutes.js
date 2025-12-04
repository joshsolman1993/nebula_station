const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleetController');
const { protect } = require('../middleware/auth');

// All fleet routes require authentication
router.use(protect);

// @route   POST /api/fleet/craft
// @desc    Craft a ship
// @access  Private
router.post('/craft', fleetController.craftShip);

// @route   POST /api/fleet/start-mission
// @desc    Start a mission
// @access  Private
router.post('/start-mission', fleetController.startMission);

// @route   POST /api/fleet/claim-mission
// @desc    Claim mission reward
// @access  Private
router.post('/claim-mission', fleetController.claimMission);

// @route   GET /api/fleet/status
// @desc    Get fleet status
// @access  Private
router.get('/status', fleetController.getFleetStatus);

module.exports = router;
