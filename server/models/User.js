const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username cannot exceed 20 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
    },
    // Game Resources
    resources: {
        metal: {
            type: Number,
            default: 500,
        },
        crystal: {
            type: Number,
            default: 300,
        },
        energy: {
            type: Number,
            default: 100,
        },
    },
    // Player Progression
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    // Premium Currency
    credits: {
        type: Number,
        default: 0,
    },
    // Fleet Management
    ships: {
        scout_drone: {
            type: Number,
            default: 0,
        },
        mining_barge: {
            type: Number,
            default: 0,
        },
        explorer_ship: {
            type: Number,
            default: 0,
        },
    },
    // Research
    completedResearch: [{
        type: String,
    }],
    activeMission: {
        type: {
            missionId: String,
            shipId: String,
            shipCount: Number,
            startTime: Date,
            endTime: Date,
            potentialReward: {
                metal: Number,
                crystal: Number,
                energy: Number,
            },
        },
        default: null,
    },
    // Timestamps
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    lastResourceUpdate: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
userSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return;
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Method to get public profile (without password)
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
