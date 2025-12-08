const express = require('express');
const router = express.Router();
const galaxyController = require('../controllers/galaxyController');
const { protect } = require('../middleware/auth');

router.get('/map', protect, galaxyController.getGalaxyMap);
router.post('/travel', protect, galaxyController.travelToSector);
router.post('/arrive', protect, galaxyController.arriveAtSector);

module.exports = router;
