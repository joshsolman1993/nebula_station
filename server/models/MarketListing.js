const mongoose = require('mongoose');

const MarketListingSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['RESOURCE', 'ARTIFACT'],
        required: true
    },
    content: {
        // For RESOURCE: { resourceType: 'metal'|'crystal'|'energy', amount: Number }
        // For ARTIFACT: { artifactId: String, instanceId: String, name: String, rarity: String }
        type: Object,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MarketListing', MarketListingSchema);
