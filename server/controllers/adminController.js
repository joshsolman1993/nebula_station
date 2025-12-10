const mongoose = require('mongoose');
const User = require('../models/User');
const Sector = require('../models/Sector');
const GlobalConfig = require('../models/GlobalConfig');
const MarketListing = require('../models/MarketListing');
const Alliance = require('../models/Alliance');
const GlobalQuest = require('../models/GlobalQuest');
const { getSectorById } = require('../utils/galaxyGenerator');


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
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all sectors
// @route   GET /api/admin/galaxy/sectors
// @access  Admin
exports.getSectors = async (req, res) => {
    try {
        const sectors = await Sector.find({}).sort({ id: 1 });
        res.json({ success: true, count: sectors.length, data: sectors });
    } catch (error) {
        console.error('Admin Get Sectors Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Regenerate a sector (Reset to default)
// @route   POST /api/admin/galaxy/regenerate
// @access  Admin
exports.regenerateSector = async (req, res) => {
    try {
        const { sectorId } = req.body;
        if (!sectorId) return res.status(400).json({ success: false, error: 'Missing sectorId' });

        const defaultData = getSectorById(sectorId);
        if (!defaultData) {
            return res.status(400).json({ success: false, error: 'Invalid Sector ID (Not in Galaxy Map Config)' });
        }

        let sector = await Sector.findOne({ id: sectorId });

        if (!sector) {
            // Create if missing
            sector = new Sector(defaultData);
        } else {
            // Reset fields
            sector.name = defaultData.name;
            sector.type = defaultData.type;
            sector.difficulty = defaultData.difficulty;
            sector.x = defaultData.x;
            sector.y = defaultData.y;
            sector.connections = defaultData.connections; // Should usually match, but safe to reset
            // Reset dynamic fields if desired? 
            // Keep owner? Proposal said "Reset... if bugged". 
            // Usually implies full reset.
            sector.ownerAllianceId = null;
            sector.currentDefense = 0;
            // Keep maxDefense based on logic? 
            // We'll set a default base defense or 0.
            sector.maxDefense = defaultData.difficulty * 100; // Formula from seedGalaxy?
            sector.structures = [];
            sector.resources = undefined; // Will be regenerated by virtual or lazy seed logic? 
            // seedGalaxy logic: sector.resources = { metal: diff*1000... }
            // Let's implement seed logic here.

            // Re-apply seed logic
            const danger = defaultData.difficulty;
            sector.resources = {
                metal: danger * 1000 + Math.floor(Math.random() * 500),
                crystal: danger * 500 + Math.floor(Math.random() * 300),
                energy: danger * 200 + Math.floor(Math.random() * 100)
            };
            sector.maxDefense = danger * 100;
        }

        await sector.save();
        res.json({ success: true, message: `Sector ${sectorId} regenerated.`, data: sector });
    } catch (error) {
        console.error('Admin Regenerate Sector Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update sector manually
// @route   PUT /api/admin/galaxy/sector/:id
// @access  Admin
exports.updateSector = async (req, res) => {
    try {
        const sectorId = req.params.id;
        const updates = req.body; // { type, difficulty, bonus... } or resources

        let sector = await Sector.findOne({ id: sectorId });
        if (!sector) return res.status(404).json({ success: false, error: 'Sector not found' });

        // Apply updates
        if (updates.type) sector.type = updates.type;
        if (updates.difficulty) {
            sector.difficulty = updates.difficulty;
            // Optionally update maxDefense?
            sector.maxDefense = updates.difficulty * 100;
        }
        if (updates.resources) {
            if (updates.resources.metal !== undefined) sector.resources.metal = updates.resources.metal;
            if (updates.resources.crystal !== undefined) sector.resources.crystal = updates.resources.crystal;
            if (updates.resources.energy !== undefined) sector.resources.energy = updates.resources.energy;
        }

        // Handle ownership clear
        if (updates.resetOwner) {
            sector.ownerAllianceId = null;
            sector.structures = [];
        }

        await sector.save();
        res.json({ success: true, message: `Sector ${sectorId} updated.`, data: sector });
    } catch (error) {
        console.error('Admin Update Sector Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Ban a user
// @route   POST /api/admin/users/:id/ban
// @access  Admin
exports.banUser = async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.isBanned = true;
        user.banReason = reason || 'Violation of rules';
        await user.save();

        res.json({ success: true, message: `User ${user.username} has been banned.`, data: user });
    } catch (error) {
        console.error('Ban Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Unban a user
// @route   POST /api/admin/users/:id/unban
// @access  Admin
exports.unbanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.isBanned = false;
        user.banReason = '';
        await user.save();

        res.json({ success: true, message: `User ${user.username} has been unbanned.`, data: user });
    } catch (error) {
        console.error('Unban Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Mute a user
// @route   POST /api/admin/users/:id/mute
// @access  Admin
exports.muteUser = async (req, res) => {
    try {
        const { durationMinutes } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.isMuted = true;
        const duration = durationMinutes ? parseInt(durationMinutes) : 60;
        user.muteExpiresAt = new Date(Date.now() + duration * 60000);
        await user.save();

        res.json({ success: true, message: `User ${user.username} muted for ${duration} minutes.`, data: user });
    } catch (error) {
        console.error('Mute Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Unmute a user
// @route   POST /api/admin/users/:id/unmute
// @access  Admin
exports.unmuteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.isMuted = false;
        user.muteExpiresAt = null;
        await user.save();

        res.json({ success: true, message: `User ${user.username} has been unmuted.`, data: user });
    } catch (error) {
        console.error('Unmute Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get Global Configuration
// @route   GET /api/admin/config
exports.getGlobalConfig = async (req, res) => {
    try {
        const configs = await GlobalConfig.find({});
        const configMap = {};
        configs.forEach(c => configMap[c.key] = c.value);

        if (configMap['RESOURCE_MULTIPLIER_METAL'] === undefined) configMap['RESOURCE_MULTIPLIER_METAL'] = 1.0;
        if (configMap['RESOURCE_MULTIPLIER_CRYSTAL'] === undefined) configMap['RESOURCE_MULTIPLIER_CRYSTAL'] = 1.0;
        if (configMap['RESOURCE_MULTIPLIER_ENERGY'] === undefined) configMap['RESOURCE_MULTIPLIER_ENERGY'] = 1.0;

        res.json({ success: true, data: configMap });
    } catch (error) {
        console.error('Get Config Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update Global Configuration
// @route   POST /api/admin/config
exports.updateGlobalConfig = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key) return res.status(400).json({ success: false, error: 'Key required' });

        const config = await GlobalConfig.findOneAndUpdate(
            { key },
            { value, updatedAt: Date.now() },
            { upsert: true, new: true }
        );

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Update Config Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get All Market Listings (Admin)
// @route   GET /api/admin/market/listings
exports.getMarketListingsAdmin = async (req, res) => {
    try {
        const listings = await MarketListing.find({})
            .sort({ createdAt: -1 })
            .populate('seller', 'username email');

        res.json({ success: true, count: listings.length, data: listings });
    } catch (error) {
        console.error('Get Admin Listings Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete Market Listing (Admin)
// @route   DELETE /api/admin/market/listing/:id
exports.deleteMarketListingAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await MarketListing.findById(id);

        if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });

        const user = await User.findById(listing.seller);
        if (user) {
            if (listing.type === 'RESOURCE') {
                const { resourceType, amount } = listing.content;
                user.resources[resourceType] += amount;
            } else if (listing.type === 'ARTIFACT') {
                user.inventory.push(listing.content);
            }
            await user.save();
        }

        await MarketListing.findByIdAndDelete(id);

        res.json({ success: true, message: 'Listing deleted and items returned to seller.' });
    } catch (error) {
        console.error('Delete Listing Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get All Alliances (Admin)
// @route   GET /api/admin/alliances
exports.getAlliancesAdmin = async (req, res) => {
    try {
        const alliances = await Alliance.find({})
            .populate('leader', 'username email')
            .sort({ level: -1, createdAt: -1 });

        // Add member count manually if not stored, or rely on array length
        const alliancesWithCounts = alliances.map(a => ({
            ...a.toObject(),
            memberCount: a.members.length
        }));

        res.json({ success: true, count: alliances.length, data: alliancesWithCounts });
    } catch (error) {
        console.error('Get Alliances Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Disband Alliance (Admin)
// @route   DELETE /api/admin/alliance/:id
exports.disbandAllianceAdmin = async (req, res) => {
    try {
        const allianceId = req.params.id;
        const alliance = await Alliance.findById(allianceId);

        if (!alliance) return res.status(404).json({ success: false, error: 'Alliance not found' });

        // Clear alliance from members
        await User.updateMany(
            { alliance: allianceId },
            { $set: { alliance: null, allianceRole: undefined } }
        );

        // Clear sector ownership
        await Sector.updateMany(
            { ownerAllianceId: allianceId },
            { $set: { ownerAllianceId: null, structures: [] } } // Removing structures too as they belong to alliance
        );

        await Alliance.findByIdAndDelete(allianceId);

        res.json({ success: true, message: `Alliance ${alliance.name} disbanded.` });
    } catch (error) {
        console.error('Disband Alliance Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Transfer Alliance Leadership (Admin)
// @route   POST /api/admin/alliance/:id/transfer-leadership
exports.transferAllianceLeadershipAdmin = async (req, res) => {
    try {
        const allianceId = req.params.id;
        const { newLeaderId } = req.body;

        if (!newLeaderId) return res.status(400).json({ success: false, error: 'New leader ID required' });

        const alliance = await Alliance.findById(allianceId);
        if (!alliance) return res.status(404).json({ success: false, error: 'Alliance not found' });

        const newLeader = await User.findById(newLeaderId);
        if (!newLeader) return res.status(404).json({ success: false, error: 'User not found' });

        if (String(newLeader.alliance) !== String(allianceId)) {
            return res.status(400).json({ success: false, error: 'User is not a member of this alliance' });
        }

        // Update old leader
        if (alliance.leader) {
            await User.findByIdAndUpdate(alliance.leader, { allianceRole: 'Member' });
        }

        // Update new leader
        newLeader.allianceRole = 'Leader';
        await newLeader.save();

        // Update alliance
        alliance.leader = newLeaderId;
        await alliance.save();

        res.json({ success: true, message: `Leadership transferred to ${newLeader.username}`, data: alliance });
    } catch (error) {
        console.error('Transfer Leadership Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};


// @desc    Trigger Invasion Event (Admin)
// @route   POST /api/admin/events/invasion
exports.triggerInvasionAdmin = async (req, res) => {
    try {
        const { difficulty = 1 } = req.body; // 1-10

        // Pick 3 random sectors (excluding Safe Haven if possible, though conflict is fun)
        const sectors = await Sector.aggregate([{ $match: { type: { $ne: 'SAFE_HAVEN' } } }, { $sample: { size: 3 } }]);

        if (sectors.length === 0) return res.status(400).json({ success: false, error: 'No suitable sectors found' });

        const duration = 60 * 60 * 1000; // 1 hour
        const expiresAt = new Date(Date.now() + duration);

        const updates = sectors.map(sector =>
            Sector.findByIdAndUpdate(sector._id, {
                $push: {
                    events: {
                        type: 'INVASION',
                        strength: difficulty,
                        expiresAt
                    }
                }
            })
        );

        await Promise.all(updates);

        res.json({
            success: true,
            message: `Invasion triggered in ${sectors.length} sectors!`,
            data: sectors.map(s => s.name)
        });
    } catch (error) {
        console.error('Trigger Invasion Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create Global Quest (Admin)
// @route   POST /api/admin/quests
exports.createGlobalQuestAdmin = async (req, res) => {
    try {
        const { type, title, description, targetAmount, targetResource, durationHours = 24 } = req.body;

        // Deactivate any existing active quests
        await GlobalQuest.updateMany({ status: 'ACTIVE' }, { $set: { status: 'FAILED', endTime: new Date() } });

        const endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000);

        const quest = await GlobalQuest.create({
            type,
            title,
            description,
            targetAmount,
            targetResource,
            status: 'ACTIVE',
            endTime
        });

        res.json({ success: true, message: 'Global Quest started', data: quest });
    } catch (error) {
        console.error('Create Quest Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get Active Global Quest (Admin)
// @route   GET /api/admin/quests/active
exports.getActiveGlobalQuest = async (req, res) => {
    try {
        const quest = await GlobalQuest.findOne({ status: 'ACTIVE' }).sort({ createdAt: -1 });
        res.json({ success: true, data: quest });
    } catch (error) {
        console.error('Get Quest Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update Global Quest (Admin)
// @route   PUT /api/admin/quests/:id
exports.updateGlobalQuestAdmin = async (req, res) => {
    try {
        const { status, progressIncrement } = req.body;
        const quest = await GlobalQuest.findById(req.params.id);

        if (!quest) return res.status(404).json({ success: false, error: 'Quest not found' });

        if (status) quest.status = status;
        if (progressIncrement) quest.currentAmount += Number(progressIncrement);

        // Check completion
        if (quest.status === 'ACTIVE' && quest.currentAmount >= quest.targetAmount) {
            quest.status = 'COMPLETED';
        }

        await quest.save();
        res.json({ success: true, data: quest });
    } catch (error) {
        console.error('Update Quest Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Toggle Maintenance Mode (Admin)
// @route   POST /api/admin/maintenance
exports.toggleMaintenanceModeAdmin = async (req, res) => {
    try {
        const { enabled } = req.body;

        await GlobalConfig.findOneAndUpdate(
            { key: 'MAINTENANCE_MODE' },
            { key: 'MAINTENANCE_MODE', value: enabled },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: `Maintenance Mode ${enabled ? 'ENABLED' : 'DISABLED'}` });
    } catch (error) {
        console.error('Toggle Maintenance Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get System Health (Admin)
// @route   GET /api/admin/health
exports.getSystemHealthAdmin = async (req, res) => {
    try {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const dbStatus = mongoose.connection.readyState; // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting

        res.json({
            success: true,
            data: {
                uptime,
                memory: {
                    rss: memoryUsage.rss, // Resident Set Size
                    heapTotal: memoryUsage.heapTotal,
                    heapUsed: memoryUsage.heapUsed
                },
                dbStatus: dbStatus === 1 ? 'Connected' : 'Disconnected'
            }
        });
    } catch (error) {
        console.error('Get Health Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create Database Backup (Admin)
// @route   GET /api/admin/backup
exports.createDatabaseBackupAdmin = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        const alliances = await Alliance.find({});
        const sectors = await Sector.find({});
        const listings = await MarketListing.find({});
        const globalConfig = await GlobalConfig.find({});
        const quests = await GlobalQuest.find({});

        const backupData = {
            timestamp: new Date(),
            version: '1.0',
            data: {
                users,
                alliances,
                sectors,
                listings,
                globalConfig,
                quests
            }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=nebula_backup_${Date.now()}.json`);
        res.json(backupData);
    } catch (error) {
        console.error('Backup Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

