const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getListings,
    createListing,
    buyListing,
    cancelListing
} = require('../controllers/marketController');

router.get('/listings', protect, getListings);
router.post('/create', protect, createListing);
router.post('/buy', protect, buyListing);
router.post('/cancel', protect, cancelListing);

module.exports = router;
