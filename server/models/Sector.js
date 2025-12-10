const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    x: {
        type: Number,
        required: true
    },
    y: {
        type: Number,
        required: true
    },
    type: {
        type: String, // e.g., 'SAFE_HAVEN', 'NEBULA'
        required: true
    },
    difficulty: {
        type: Number,
        default: 1
    },
    connections: [{
        type: String // We store sector IDs here as strings for graph navigation
    }],
    ownerAllianceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alliance',
        default: null
    },
    defenseLevel: {
        type: Number,
        default: 0
    },
    maxDefense: {
        type: Number,
        default: 1000
    },
    currentDefense: {
        type: Number,
        default: 1000
    },
    structures: [{
        type: String // Structure IDs from gameData
    }],
    events: [{
        type: { type: String, enum: ['INVASION', 'STORM', 'ANOMALY'] },
        strength: Number,
        expiresAt: Date
    }]
});

module.exports = mongoose.model('Sector', sectorSchema);
