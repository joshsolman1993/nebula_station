const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    getStats,
    getUsers,
    giveResources,
    resetUser,
    getSectors,
    regenerateSector,
    updateSector
} = require('../controllers/adminController');


// Protect all routes with auth and admin middleware
router.use(protect);
router.use(adminMiddleware);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.post('/give-resources', giveResources);
router.post('/reset-user', resetUser);

// Galaxy
router.get('/galaxy/sectors', getSectors);
router.post('/galaxy/regenerate', regenerateSector);
router.put('/galaxy/sector/:id', updateSector);

// Moderation
const { banUser, unbanUser, muteUser, unmuteUser } = require('../controllers/adminController');
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);
router.post('/users/:id/mute', muteUser);
router.post('/users/:id/unmute', unmuteUser);


// Economy
const { getGlobalConfig, updateGlobalConfig, getMarketListingsAdmin, deleteMarketListingAdmin } = require('../controllers/adminController');
router.get('/config', getGlobalConfig);
router.post('/config', updateGlobalConfig);
router.get('/market/listings', getMarketListingsAdmin);
router.delete('/market/listing/:id', deleteMarketListingAdmin);

// Alliance Administration
const { getAlliancesAdmin, disbandAllianceAdmin, transferAllianceLeadershipAdmin } = require('../controllers/adminController');
router.get('/alliances', getAlliancesAdmin);
router.delete('/alliance/:id', disbandAllianceAdmin);
router.post('/alliance/:id/transfer-leadership', transferAllianceLeadershipAdmin);

// Event Management
const { triggerInvasionAdmin, createGlobalQuestAdmin, getActiveGlobalQuest, updateGlobalQuestAdmin } = require('../controllers/adminController');
router.post('/events/invasion', triggerInvasionAdmin);
router.post('/quests', createGlobalQuestAdmin);
router.get('/quests/active', getActiveGlobalQuest);
router.put('/quests/:id', updateGlobalQuestAdmin);
// Technical Tools
const { toggleMaintenanceModeAdmin, getSystemHealthAdmin, createDatabaseBackupAdmin } = require('../controllers/adminController');
router.post('/maintenance', toggleMaintenanceModeAdmin);
router.get('/health', getSystemHealthAdmin);
router.get('/backup', createDatabaseBackupAdmin);

module.exports = router;
