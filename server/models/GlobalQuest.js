const mongoose = require('mongoose');

const globalQuestSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['DONATION', 'COMBAT', 'BOSS'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    targetResource: {
        type: String, // e.g., 'metal', 'crystal' (only for DONATION)
        default: null
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    reward: {
        type: Map,
        of: String, // flexible reward description/data
        default: {}
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'FAILED'],
        default: 'ACTIVE'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('GlobalQuest', globalQuestSchema);
