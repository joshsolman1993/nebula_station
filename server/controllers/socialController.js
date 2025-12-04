const User = require('../models/User');
const Station = require('../models/Station');

// @desc    Get leaderboard (top players)
// @route   GET /api/social/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Get top players sorted by XP
        const players = await User.find()
            .select('username level xp ships createdAt')
            .sort({ xp: -1, level: -1 })
            .limit(limit);

        // Calculate fleet power for each player
        const leaderboard = await Promise.all(
            players.map(async (player) => {
                const station = await Station.findOne({ userId: player._id });

                // Calculate total power
                const buildingCount = station ? station.layout.length : 0;
                const fleetSize = (player.ships.scout_drone || 0) + (player.ships.mining_barge || 0);
                const totalPower = (player.level * 100) + (buildingCount * 50) + (fleetSize * 25);

                return {
                    username: player.username,
                    level: player.level,
                    xp: player.xp,
                    fleetPower: totalPower,
                    fleetSize,
                    buildingCount,
                    joinedAt: player.createdAt,
                };
            })
        );

        res.json({
            success: true,
            leaderboard,
        });
    } catch (error) {
        console.error('❌ Get leaderboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard',
        });
    }
};

// @desc    Get player profile by username
// @route   GET /api/social/profile/:username
// @access  Public
exports.getProfile = async (req, res) => {
    try {
        const { username } = req.params;

        // Find user by username (case-insensitive)
        const user = await User.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') }
        }).select('username level xp ships createdAt lastLogin');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Player not found',
            });
        }

        // Get station data
        const station = await Station.findOne({ userId: user._id });
        const buildingCount = station ? station.layout.length : 0;

        // Calculate stats
        const fleetSize = (user.ships.scout_drone || 0) + (user.ships.mining_barge || 0);
        const totalPower = (user.level * 100) + (buildingCount * 50) + (fleetSize * 25);

        // Calculate account age in days
        const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

        // Determine rank title based on level
        let rankTitle = 'Cadet';
        if (user.level >= 10) rankTitle = 'Admiral';
        else if (user.level >= 5) rankTitle = 'Captain';

        // Calculate total expeditions (for now, just a placeholder)
        const totalExpeditions = 0; // TODO: Track this in user model

        res.json({
            success: true,
            profile: {
                username: user.username,
                level: user.level,
                xp: user.xp,
                rankTitle,
                fleetSize,
                buildingCount,
                totalPower,
                accountAge,
                totalExpeditions,
                joinedAt: user.createdAt,
                lastLogin: user.lastLogin,
                ships: user.ships,
            },
        });
    } catch (error) {
        console.error('❌ Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile',
        });
    }
};
