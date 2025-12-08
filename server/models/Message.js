const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'system'],
        default: 'user'
    },
    type: {
        type: String,
        enum: ['global', 'system', 'admin'],
        default: 'global'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);
