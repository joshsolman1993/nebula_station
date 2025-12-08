const express = require('express');
const router = express.Router();
const {
    getAlliances,
    createAlliance,
    joinAlliance,
    leaveAlliance,
    getMyAlliance,
    donateResources,
    claimSector
} = require('../controllers/allianceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAlliances);
router.post('/create', createAlliance);
router.post('/join', joinAlliance);
router.post('/leave', leaveAlliance);
router.get('/my-alliance', getMyAlliance);
router.post('/donate', donateResources);
router.post('/claim-sector', claimSector);

module.exports = router;
