const User = require('../models/User');

// @desc    Get global server stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        // Aggregate total resources mined/held
        const resourceStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalMetal: { $sum: '$resources.metal' },
                    totalCrystal: { $sum: '$resources.crystal' },
                    totalEnergy: { $sum: '$resources.energy' },
                    totalCredits: { $sum: '$credits' },
                    totalShips: {
                        $sum: {
                            $add: [
                                '$ships.scout_drone',
                                '$ships.mining_barge',
                                '$ships.explorer_ship'
                            ]
                        }
                    }
                }
            }
        ]);

        const stats = resourceStats[0] || {
            totalMetal: 0,
            totalCrystal: 0,
            totalEnergy: 0,
            totalCredits: 0,
            totalShips: 0
        };

        res.json({
            success: true,
            data: {
                totalUsers,
                totalResources: {
                    metal: stats.totalMetal,
                    crystal: stats.totalCrystal,
                    energy: stats.totalEnergy
                },
                totalCredits: stats.totalCredits,
                totalShips: stats.totalShips,
                uptime: process.uptime()
            }
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('username email role level lastLogin createdAt resources ships')
            .sort({ createdAt: -1 });

        const formattedUsers = users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            level: user.level,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            resources: user.resources,
            ships: user.ships
        }));

        res.json({
            success: true,
            count: formattedUsers.length,
            data: formattedUsers
        });
    } catch (error) {
        console.error('Admin Get Users Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Give resources to a user (God Mode)
// @route   POST /api/admin/give-resources
// @access  Admin
exports.giveResources = async (req, res) => {
    try {
        const { targetUserId, resources } = req.body;

        if (!targetUserId || !resources) {
            return res.status(400).json({ success: false, error: 'Missing targetUserId or resources' });
        }

        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Add resources
        if (resources.metal) user.resources.metal += Number(resources.metal);
        if (resources.crystal) user.resources.crystal += Number(resources.crystal);
        if (resources.energy) user.resources.energy += Number(resources.energy);
        if (resources.credits) user.credits += Number(resources.credits);

        await user.save();

        res.json({
            success: true,
            message: `Resources added to ${user.username}`,
            data: user.resources
        });
    } catch (error) {
        console.error('Admin Give Resources Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Reset user progress
// @route   POST /api/admin/reset-user
// @access  Admin
exports.resetUser = async (req, res) => {
    try {
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ success: false, error: 'Missing targetUserId' });
        }

        const user = await User.findById(targetUserId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Reset fields
        user.resources = { metal: 500, crystal: 300, energy: 100 };
        user.ships = { scout_drone: 0, mining_barge: 0, explorer_ship: 0 };
        user.xp = 0;
        user.level = 1;
        user.credits = 0;
        user.completedResearch = [];
        user.inventory = [];
        user.equipment = { toolSlot: null, coreSlot: null };
        user.damagedShips = {};
        user.completedQuests = [];
        user.currentQuestIndex = 0;
        user.activeMission = null;

        await user.save();

        res.json({
            success: true,
            message: `User ${user.username} has been reset.`,
            data: user
        });
    } catch (error) {
        console.error('Admin Reset User Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
