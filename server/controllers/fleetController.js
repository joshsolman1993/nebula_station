const User = require('../models/User');
const { getShipById, getMissionById, ARTIFACTS } = require('../config/gameData');
const { calculateProduction } = require('../utils/productionEngine');
const Station = require('../models/Station');

// @desc    Craft a ship
// @route   POST /api/fleet/craft
// @access  Private
exports.craftShip = async (req, res) => {
    try {
        const { shipId } = req.body;

        if (!shipId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide shipId',
            });
        }

        // Get ship data
        const shipData = getShipById(shipId);
        if (!shipData) {
            return res.status(400).json({
                success: false,
                error: 'Invalid ship ID',
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

        // Check technology requirement
        if (shipData.requiredTech) {
            if (!user.completedResearch.includes(shipData.requiredTech)) {
                return res.status(400).json({
                    success: false,
                    error: `Technology required: ${shipData.requiredTech}`,
                });
            }
        }

        // Calculate production before crafting
        calculateProduction(user, station);
        await user.save();

        // Check if user has enough resources
        const cost = shipData.cost;
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

        // Deduct resources
        user.resources.metal -= cost.metal;
        user.resources.crystal -= cost.crystal;
        user.resources.energy -= cost.energy;
        user.credits -= cost.credits;

        // Add ship to fleet
        user.ships[shipId] = (user.ships[shipId] || 0) + 1;

        await user.save();

        console.log(`✅ Ship crafted: ${shipData.name} by ${user.username}`);

        res.json({
            success: true,
            message: `${shipData.name} crafted successfully!`,
            user: {
                id: user._id,
                username: user.username,
                resources: user.resources,
                credits: user.credits,
                ships: user.ships,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('❌ Craft ship error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to craft ship',
        });
    }
};

// @desc    Start a mission
// @route   POST /api/fleet/start-mission
// @access  Private
exports.startMission = async (req, res) => {
    try {
        const { missionId, shipId, shipCount } = req.body;

        if (!missionId || !shipId || !shipCount) {
            return res.status(400).json({
                success: false,
                error: 'Please provide missionId, shipId, and shipCount',
            });
        }

        if (shipCount < 1) {
            return res.status(400).json({
                success: false,
                error: 'Ship count must be at least 1',
            });
        }

        // Get mission and ship data
        const missionData = getMissionById(missionId);
        const shipData = getShipById(shipId);

        if (!missionData || !shipData) {
            return res.status(400).json({
                success: false,
                error: 'Invalid mission or ship ID',
            });
        }

        // Get user
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Check Sector Compatibility
        if (missionData.requiredSectorType) {
            const { getSectorById } = require('../utils/galaxyGenerator');
            const currentSectorId = user.currentSector || 'sec_alpha';
            const sector = getSectorById(currentSectorId);

            if (!sector || sector.type !== missionData.requiredSectorType) {
                return res.status(400).json({
                    success: false,
                    error: `Mission requires ${missionData.requiredSectorType} sector. Current: ${sector ? sector.type : 'Unknown'}`,
                });
            }
        }

        // Check if user already has an active mission
        if (user.activeMission) {
            return res.status(400).json({
                success: false,
                error: 'You already have an active mission. Complete it first.',
            });
        }

        // Check if user has enough ships
        const availableShips = user.ships[shipId] || 0;
        if (availableShips < shipCount) {
            return res.status(400).json({
                success: false,
                error: `Insufficient ships. Required: ${shipCount}, Available: ${availableShips}`,
            });
        }

        // Calculate mission duration based on ship speed
        const baseDuration = missionData.duration;
        const actualDuration = Math.floor(baseDuration / shipData.speedModifier);

        const now = new Date();
        const endTime = new Date(now.getTime() + actualDuration * 1000);

        // Calculate potential reward (base * shipCount * capacity)
        const potentialReward = {
            metal: Math.floor(missionData.baseReward.metal * shipCount * shipData.capacityModifier),
            crystal: Math.floor(missionData.baseReward.crystal * shipCount * shipData.capacityModifier),
            energy: Math.floor(missionData.baseReward.energy * shipCount * shipData.capacityModifier),
        };

        // Set active mission
        user.activeMission = {
            missionId,
            shipId,
            shipCount,
            startTime: now,
            endTime,
            potentialReward,
        };

        // Deduct ships from fleet (they're on mission)
        user.ships[shipId] -= shipCount;

        await user.save();

        console.log(`✅ Mission started: ${missionData.name} by ${user.username} with ${shipCount}x ${shipData.name}`);

        res.json({
            success: true,
            message: `Mission "${missionData.name}" launched!`,
            activeMission: user.activeMission,
        });
    } catch (error) {
        console.error('❌ Start mission error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to start mission',
        });
    }
};

// @desc    Claim mission reward
// @route   POST /api/fleet/claim-mission
// @access  Private
exports.claimMission = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const station = await Station.findOne({ userId: req.userId });

        if (!user || !station) {
            return res.status(404).json({
                success: false,
                error: 'User or station not found',
            });
        }

        // Check if user has an active mission
        if (!user.activeMission) {
            return res.status(400).json({
                success: false,
                error: 'No active mission to claim',
            });
        }

        const now = new Date();
        const endTime = new Date(user.activeMission.endTime);

        // Check if mission is complete
        if (now < endTime) {
            const remainingSeconds = Math.floor((endTime - now) / 1000);
            return res.status(400).json({
                success: false,
                error: `Mission not complete yet. ${remainingSeconds} seconds remaining.`,
                remainingSeconds,
            });
        }

        // Calculate production before claiming
        calculateProduction(user, station);

        // Generate reward with random variance (0.8 - 1.2)
        const variance = 0.8 + Math.random() * 0.4;
        const actualReward = {
            metal: Math.floor(user.activeMission.potentialReward.metal * variance),
            crystal: Math.floor(user.activeMission.potentialReward.crystal * variance),
            energy: Math.floor(user.activeMission.potentialReward.energy * variance),
        };

        // Add reward to user resources
        user.resources.metal += actualReward.metal;
        user.resources.crystal += actualReward.crystal;
        user.resources.energy += actualReward.energy;

        // Artifact Drop Logic (30% chance)
        let droppedArtifact = null;
        if (Math.random() < 0.30) {
            // Select random artifact based on rarity weights
            // Simple weighted random: Common (60%), Rare (25%), Epic (10%), Legendary (5%)
            const rand = Math.random();
            let rarity = 'common';
            if (rand > 0.95) rarity = 'legendary';
            else if (rand > 0.85) rarity = 'epic';
            else if (rand > 0.60) rarity = 'rare';

            const possibleArtifacts = ARTIFACTS.filter(a => a.rarity === rarity);
            if (possibleArtifacts.length > 0) {
                const artifact = possibleArtifacts[Math.floor(Math.random() * possibleArtifacts.length)];

                // Add to inventory
                const existingItem = user.inventory.find(i => i.itemId === artifact.id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    user.inventory.push({ itemId: artifact.id, quantity: 1 });
                }
                droppedArtifact = artifact;
                console.log(`🎁 Artifact dropped for ${user.username}: ${artifact.name} (${rarity})`);
            }
        }

        // Return ships to fleet
        const shipId = user.activeMission.shipId;
        const shipCount = user.activeMission.shipCount;
        user.ships[shipId] = (user.ships[shipId] || 0) + shipCount;

        // Store mission data for response
        const completedMission = {
            missionId: user.activeMission.missionId,
            shipId: user.activeMission.shipId,
            shipCount: user.activeMission.shipCount,
            reward: actualReward,
        };

        // Clear active mission
        user.activeMission = null;

        await user.save();

        console.log(`✅ Mission claimed by ${user.username}: +${actualReward.metal} Metal, +${actualReward.crystal} Crystal, +${actualReward.energy} Energy`);

        res.json({
            success: true,
            message: 'Mission completed successfully!',
            reward: actualReward,
            droppedArtifact,
            completedMission,
            user: {
                id: user._id,
                username: user.username,
                resources: user.resources,
                credits: user.credits,
                ships: user.ships,
                inventory: user.inventory,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('❌ Claim mission error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to claim mission',
        });
    }
};

// @desc    Get fleet status
// @route   GET /api/fleet/status
// @access  Private
exports.getFleetStatus = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.json({
            success: true,
            ships: user.ships,
            activeMission: user.activeMission,
        });
    } catch (error) {
        console.error('❌ Get fleet status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch fleet status',
        });
    }
};
