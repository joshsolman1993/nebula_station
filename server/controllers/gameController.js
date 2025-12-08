const User = require('../models/User');
const Station = require('../models/Station');
const { getBuildingById, getTechnologyById } = require('../config/gameData');
const { calculateProduction, getProductionRates } = require('../utils/productionEngine');

// @desc    Get user's station
// @route   GET /api/game/station
// @access  Private
exports.getStation = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const station = await Station.findOne({ userId: req.userId });

        if (!user || !station) {
            return res.status(404).json({
                success: false,
                error: 'User or station not found',
            });
        }

        // Calculate production and update resources
        const productionStats = calculateProduction(user, station);

        // Save updated user if resources were updated
        if (productionStats.updated) {
            await user.save();
        }

        // Get current production rates
        const rates = getProductionRates(station, user);

        res.json({
            success: true,
            station: {
                layout: station.layout,
                size: station.size,
                createdAt: station.createdAt,
                updatedAt: station.updatedAt,
            },
            user: {
                id: user._id,
                username: user.username,
                resources: user.resources,
                credits: user.credits,
                xp: user.xp,
                level: user.level,
                completedResearch: user.completedResearch,
                completedQuests: user.completedQuests,
                currentQuestIndex: user.currentQuestIndex,
                role: user.role,
            },
            production: rates.production,
            consumption: rates.consumption,
            netEnergy: rates.netEnergy,
            efficiency: rates.efficiency,
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

        // Check technology requirement
        if (buildingData.requiredTech) {
            if (!user.completedResearch.includes(buildingData.requiredTech)) {
                return res.status(400).json({
                    success: false,
                    error: `Technology required: ${buildingData.requiredTech}`,
                });
            }
        }

        // Calculate production and update resources BEFORE building
        const productionStats = calculateProduction(user, station);
        if (productionStats.updated) {
            await user.save();
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

        // Get updated production rates
        const rates = getProductionRates(station, user);

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
                completedResearch: user.completedResearch,
                role: user.role,
            },
            station: {
                layout: station.layout,
                size: station.size,
            },
            production: rates.production,
            consumption: rates.consumption,
            netEnergy: rates.netEnergy,
            efficiency: rates.efficiency,
        });
    } catch (error) {
        console.error('❌ Build building error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to build building',
        });
    }
};

// @desc    Research a technology
// @route   POST /api/game/research
// @access  Private
exports.researchTechnology = async (req, res) => {
    try {
        const { techId } = req.body;

        if (!techId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a technology ID',
            });
        }

        const techData = getTechnologyById(techId);
        if (!techData) {
            return res.status(400).json({
                success: false,
                error: 'Invalid technology ID',
            });
        }

        const user = await User.findById(req.userId);
        const station = await Station.findOne({ userId: req.userId });

        if (!user || !station) {
            return res.status(404).json({
                success: false,
                error: 'User or station not found',
            });
        }

        // Check if already researched
        if (user.completedResearch.includes(techId)) {
            return res.status(400).json({
                success: false,
                error: 'Technology already researched',
            });
        }

        // Check if Research Lab exists
        const hasResearchLab = station.layout.some(building => building.buildingId === 'research_lab');
        if (!hasResearchLab) {
            return res.status(400).json({
                success: false,
                error: 'Research Lab required to conduct research',
            });
        }

        // Check resources
        const cost = techData.cost;
        if (user.resources.metal < cost.metal) {
            return res.status(400).json({
                success: false,
                error: `Insufficient Metal. Required: ${cost.metal}`,
            });
        }
        if (user.resources.crystal < cost.crystal) {
            return res.status(400).json({
                success: false,
                error: `Insufficient Crystal. Required: ${cost.crystal}`,
            });
        }
        if (user.resources.energy < cost.energy) {
            return res.status(400).json({
                success: false,
                error: `Insufficient Energy. Required: ${cost.energy}`,
            });
        }

        // Deduct resources
        user.resources.metal -= cost.metal;
        user.resources.crystal -= cost.crystal;
        user.resources.energy -= cost.energy;

        // Add technology
        user.completedResearch.push(techId);

        await user.save();

        console.log(`✅ Research completed: ${techData.name} by ${user.username}`);

        // Get updated production rates
        const rates = getProductionRates(station, user);

        res.json({
            success: true,
            message: `${techData.name} researched successfully!`,
            user: {
                id: user._id,
                username: user.username,
                resources: user.resources,
                credits: user.credits,
                xp: user.xp,
                level: user.level,
                completedResearch: user.completedResearch,
                role: user.role,
            },
            production: rates.production,
            consumption: rates.consumption,
            netEnergy: rates.netEnergy,
            efficiency: rates.efficiency,
        });
    } catch (error) {
        console.error('❌ Research error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to research technology',
        });
    }
};

// @desc    Equip an item
// @route   POST /api/game/equip
// @access  Private
exports.equipItem = async (req, res) => {
    try {
        const { itemId, slot } = req.body;

        if (!itemId || !slot) {
            return res.status(400).json({
                success: false,
                error: 'Please provide itemId and slot',
            });
        }

        const user = await User.findById(req.userId);
        const station = await Station.findOne({ userId: req.userId });

        if (!user || !station) {
            return res.status(404).json({
                success: false,
                error: 'User or station not found',
            });
        }

        // Check if item exists in inventory
        const inventoryItemIndex = user.inventory.findIndex(i => i.itemId === itemId);
        if (inventoryItemIndex === -1) {
            return res.status(400).json({
                success: false,
                error: 'Item not found in inventory',
            });
        }

        // Check if item is valid and matches slot
        const artifact = getArtifactById(itemId);
        if (!artifact) {
            return res.status(400).json({
                success: false,
                error: 'Invalid artifact ID',
            });
        }

        if (artifact.slot !== slot) {
            return res.status(400).json({
                success: false,
                error: `Item cannot be equipped in ${slot} slot. Requires ${artifact.slot}.`,
            });
        }

        // Check if slot is valid
        if (!['toolSlot', 'coreSlot'].includes(slot + 'Slot')) {
            // The slot in request is 'tool' or 'core', but in DB it's 'toolSlot' or 'coreSlot'
            // Actually, let's align them.
            // If request sends 'tool', we map to 'toolSlot'.
        }

        const dbSlot = slot + 'Slot';
        if (!user.equipment.hasOwnProperty(dbSlot)) {
            return res.status(400).json({
                success: false,
                error: `Invalid equipment slot: ${slot}`,
            });
        }

        // Unequip existing item if any
        const existingItemId = user.equipment[dbSlot];
        if (existingItemId) {
            // Add back to inventory
            const existingInvItem = user.inventory.find(i => i.itemId === existingItemId);
            if (existingInvItem) {
                existingInvItem.quantity += 1;
            } else {
                user.inventory.push({ itemId: existingItemId, quantity: 1 });
            }
        }

        // Equip new item
        user.equipment[dbSlot] = itemId;

        // Remove from inventory (decrease quantity)
        if (user.inventory[inventoryItemIndex].quantity > 1) {
            user.inventory[inventoryItemIndex].quantity -= 1;
        } else {
            user.inventory.splice(inventoryItemIndex, 1);
        }

        // Recalculate production with new equipment
        const rates = getProductionRates(station, user);

        // Save user (and station if needed, though getProductionRates doesn't modify station)
        await user.save();

        console.log(`✅ Item equipped: ${artifact.name} in ${slot} by ${user.username}`);

        res.json({
            success: true,
            message: `${artifact.name} equipped successfully!`,
            user: {
                id: user._id,
                username: user.username,
                resources: user.resources,
                credits: user.credits,
                inventory: user.inventory,
                equipment: user.equipment,
                role: user.role,
            },
            production: rates.production,
            consumption: rates.consumption,
            netEnergy: rates.netEnergy,
            efficiency: rates.efficiency,
        });

    } catch (error) {
        console.error('❌ Equip item error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to equip item',
        });
    }
};

// @desc    Unequip an item
// @route   POST /api/game/unequip
// @access  Private
exports.unequipItem = async (req, res) => {
    try {
        const { slot } = req.body;

        if (!slot) {
            return res.status(400).json({
                success: false,
                error: 'Please provide slot',
            });
        }

        const user = await User.findById(req.userId);
        const station = await Station.findOne({ userId: req.userId });

        if (!user || !station) {
            return res.status(404).json({
                success: false,
                error: 'User or station not found',
            });
        }

        const dbSlot = slot + 'Slot';
        if (!user.equipment.hasOwnProperty(dbSlot)) {
            return res.status(400).json({
                success: false,
                error: `Invalid equipment slot: ${slot}`,
            });
        }

        const itemId = user.equipment[dbSlot];
        if (!itemId) {
            return res.status(400).json({
                success: false,
                error: 'Slot is already empty',
            });
        }

        // Add back to inventory
        const existingInvItem = user.inventory.find(i => i.itemId === itemId);
        if (existingInvItem) {
            existingInvItem.quantity += 1;
        } else {
            user.inventory.push({ itemId, quantity: 1 });
        }

        // Clear slot
        user.equipment[dbSlot] = null;

        // Recalculate production
        const rates = getProductionRates(station, user);

        await user.save();

        console.log(`✅ Item unequipped from ${slot} by ${user.username}`);

        res.json({
            success: true,
            message: 'Item unequipped successfully!',
            user: {
                id: user._id,
                username: user.username,
                resources: user.resources,
                credits: user.credits,
                inventory: user.inventory,
                equipment: user.equipment,
                role: user.role,
            },
            production: rates.production,
            consumption: rates.consumption,
            netEnergy: rates.netEnergy,
            efficiency: rates.efficiency,
        });

    } catch (error) {
        console.error('❌ Unequip item error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to unequip item',
        });
    }
};

// @desc    Learn or upgrade a talent
// @route   POST /api/game/talents/learn
// @access  Private
exports.learnTalent = async (req, res) => {
    try {
        const { talentId } = req.body;
        const { getTalentById } = require('../config/gameData');

        if (!talentId) {
            return res.status(400).json({ success: false, error: 'Talent ID required' });
        }

        const talent = getTalentById(talentId);
        if (!talent) {
            return res.status(400).json({ success: false, error: 'Invalid talent ID' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check points
        if (user.talentPoints < 1) {
            return res.status(400).json({ success: false, error: 'Not enough Talent Points' });
        }

        // Check max level
        const currentLevel = user.talents.get(talentId) || 0;
        if (currentLevel >= talent.maxLevel) {
            return res.status(400).json({ success: false, error: 'Talent already at max level' });
        }

        // Check Tier requirements (Simplified: Must have at least 1 point in previous tier of same branch?)
        // Or just check if previous tier exists.
        // Let's implement strict tier check: To unlock Tier 2, must have 5 points in Tier 1 of same branch?
        // Or simpler: To unlock Tier N, must have (N-1) * 5 points in that branch.

        // Calculate points spent in this branch
        let pointsInBranch = 0;
        const { TALENTS } = require('../config/gameData');
        const branchTalents = TALENTS[talent.branch];

        branchTalents.forEach(t => {
            pointsInBranch += (user.talents.get(t.id) || 0);
        });

        const requiredPoints = (talent.tier - 1) * 5;
        if (pointsInBranch < requiredPoints) {
            return res.status(400).json({ success: false, error: `Need ${requiredPoints} points in ${talent.branch} to unlock Tier ${talent.tier}` });
        }

        // Apply
        user.talentPoints -= 1;
        user.talents.set(talentId, currentLevel + 1);

        await user.save();

        res.json({
            success: true,
            message: `Learned ${talent.name} (Level ${currentLevel + 1})`,
            user: {
                talentPoints: user.talentPoints,
                talents: user.talents
            }
        });

    } catch (error) {
        console.error('Talent Learn Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
