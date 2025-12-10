const mongoose = require('mongoose');

const allianceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Alliance name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Name must be at least 3 characters'],
        maxlength: [30, 'Name cannot exceed 30 characters']
    },
    tag: {
        type: String,
        required: [true, 'Tag is required'],
        unique: true,
        uppercase: true
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    resources: {
        credits: { type: Number, default: 0 },
        metal: { type: Number, default: 0 },
        crystal: { type: Number, default: 0 },
        energy: { type: Number, default: 0 }
    },
    level: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alliance', allianceSchema);
