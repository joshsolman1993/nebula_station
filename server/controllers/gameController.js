const User = require('../models/User');
const Station = require('../models/Station');
const { getBuildingById } = require('../config/gameData');

// @desc    Get user's station
// @route   GET /api/game/station
// @access  Private
exports.getStation = async (req, res) => {
    try {
        const station = await Station.findOne({ userId: req.userId });

        if (!station) {
            return res.status(404).json({
                success: false,
                error: 'Station not found',
            });
        }

        res.json({
            success: true,
            station: {
                layout: station.layout,
                size: station.size,
                createdAt: station.createdAt,
                updatedAt: station.updatedAt,
            },
        });
    } catch (error) {
        console.error('❌ Get station error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch station data',
        });
    }
};

// @desc    Build a building on the station
// @route   POST /api/game/build
// @access  Private
exports.buildBuilding = async (req, res) => {
    try {
        const { buildingId, x, y } = req.body;

        // Validation
        if (!buildingId || x === undefined || y === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Please provide buildingId, x, and y coordinates',
            });
        }

        // Get building data
        const buildingData = getBuildingById(buildingId);
        if (!buildingData) {
            return res.status(400).json({
                success: false,
                error: 'Invalid building ID',
            });
        }

        // Get user and station
        const user = await User.findById(req.userId);
        const station = await Station.findOne({ userId: req.userId });

        if (!user || !station) {
            return res.status(404).json({
                success: false,
                error: 'User or station not found',
            });
        }

        // Check if position is valid
        if (x < 0 || x >= station.size || y < 0 || y >= station.size) {
            return res.status(400).json({
                success: false,
                error: `Position out of bounds. Grid size is ${station.size}x${station.size}`,
            });
        }

        // Check if position is occupied
        if (station.isPositionOccupied(x, y)) {
            return res.status(400).json({
                success: false,
                error: 'Position already occupied',
            });
        }

        // Check if user has enough resources
        const cost = buildingData.cost;
        if (user.resources.metal < cost.metal) {
            return res.status(400).json({
                success: false,
                error: `Insufficient Metal. Required: ${cost.metal}, Available: ${user.resources.metal}`,
            });
        }
        if (user.resources.crystal < cost.crystal) {
            return res.status(400).json({
                success: false,
                error: `Insufficient Crystal. Required: ${cost.crystal}, Available: ${user.resources.crystal}`,
            });
        }
        if (user.resources.energy < cost.energy) {
            return res.status(400).json({
                success: false,
                error: `Insufficient Energy. Required: ${cost.energy}, Available: ${user.resources.energy}`,
            });
        }
        if (user.credits < cost.credits) {
            return res.status(400).json({
                success: false,
                error: `Insufficient Credits. Required: ${cost.credits}, Available: ${user.credits}`,
            });
        }

        // Deduct resources from user
        user.resources.metal -= cost.metal;
        user.resources.crystal -= cost.crystal;
        user.resources.energy -= cost.energy;
        user.credits -= cost.credits;

        // Add building to station
        station.addBuilding(x, y, buildingId);

        // Save both user and station
        await user.save();
        await station.save();

        console.log(`✅ Building placed: ${buildingData.name} at (${x}, ${y}) by ${user.username}`);

        res.json({
            success: true,
            message: `${buildingData.name} built successfully!`,
            user: {
                id: user._id,
                username: user.username,
                resources: user.resources,
                credits: user.credits,
                xp: user.xp,
                level: user.level,
            },
            station: {
                layout: station.layout,
                size: station.size,
            },
        });
    } catch (error) {
        console.error('❌ Build building error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to build building',
        });
    }
};
