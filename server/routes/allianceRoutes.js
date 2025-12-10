const express = require('express');
const router = express.Router();
const {
    getAlliances,
    createAlliance,
    joinAlliance,
    leaveAlliance,
    getMyAlliance,
    donateResources,
    claimSector,
    siegeSector,
    reinforceSector,
    buildSectorStructure
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
router.post('/siege-sector', siegeSector);
router.post('/reinforce-sector', reinforceSector);
router.post('/build-sector', buildSectorStructure);

module.exports = router;
