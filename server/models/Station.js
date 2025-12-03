const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    layout: [
        {
            x: {
                type: Number,
                required: true,
                min: 0,
            },
            y: {
                type: Number,
                required: true,
                min: 0,
            },
            buildingId: {
                type: String,
                required: true,
            },
            level: {
                type: Number,
                default: 1,
                min: 1,
            },
            builtAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    size: {
        type: Number,
        default: 8,
        min: 5,
        max: 12,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt timestamp before saving
stationSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Method to check if a position is occupied
stationSchema.methods.isPositionOccupied = function (x, y) {
    return this.layout.some(building => building.x === x && building.y === y);
};

// Method to get building at position
stationSchema.methods.getBuildingAt = function (x, y) {
    return this.layout.find(building => building.x === x && building.y === y);
};

// Method to add building
stationSchema.methods.addBuilding = function (x, y, buildingId) {
    if (this.isPositionOccupied(x, y)) {
        throw new Error('Position already occupied');
    }

    if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
        throw new Error('Position out of bounds');
    }

    this.layout.push({
        x,
        y,
        buildingId,
        level: 1,
        builtAt: Date.now(),
    });
};

module.exports = mongoose.model('Station', stationSchema);
