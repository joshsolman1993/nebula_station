const Alliance = require('../models/Alliance');
const Sector = require('../models/Sector'); // Import Sector model

// ... existing code ...

// @desc    Claim a sector for the alliance
// @route   POST /api/alliance/claim-sector
// @access  Private
exports.claimSector = async (req, res) => {
    try {
        const { sectorId } = req.body;
        const user = await User.findById(req.userId);

        if (!user || !user.alliance) return res.status(400).json({ success: false, error: 'Not in an alliance' });

        // Check Permissions (Leader or Officer)
        if (!['Leader', 'Officer'].includes(user.allianceRole)) {
            return res.status(403).json({ success: false, error: 'Only Leaders and Officers can claim sectors' });
        }

        const alliance = await Alliance.findById(user.alliance);
        const sector = await Sector.findOne({ id: sectorId });

        if (!sector) return res.status(404).json({ success: false, error: 'Sector not found' });
        if (sector.ownerAllianceId) return res.status(400).json({ success: false, error: 'Sector is already claimed' });

        // Cost: 10,000 Metal, 5,000 Credits
        const COST = { metal: 10000, credits: 5000 };

        if (alliance.resources.metal < COST.metal || alliance.resources.credits < COST.credits) {
            return res.status(400).json({
                success: false,
                error: `Insufficient Alliance Resources. Required: ${COST.metal} Metal, ${COST.credits} Credits.`
            });
        }

        // Processing
        alliance.resources.metal -= COST.metal;
        alliance.resources.credits -= COST.credits;
        sector.ownerAllianceId = alliance._id;

        await alliance.save();
        await sector.save();

        res.json({ success: true, message: `Sector ${sector.name} claimed for ${alliance.name}!` });

    } catch (error) {
        console.error('Claim Sector Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
const User = require('../models/User');

const CREATE_COST = 1000;

// @desc    Get all alliances
// @route   GET /api/alliance
// @access  Private
exports.getAlliances = async (req, res) => {
    try {
        const alliances = await Alliance.find().select('name tag members level mode').lean();
        // Add member count
        const result = alliances.map(a => ({
            _id: a._id,
            name: a.name,
            tag: a.tag,
            level: a.level,
            memberCount: a.members.length
        }));
        res.json({ success: true, alliances: result });
    } catch (error) {
        console.error('Get Alliances Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create an alliance
// @route   POST /api/alliance/create
// @access  Private
exports.createAlliance = async (req, res) => {
    try {
        const { name, tag } = req.body;
        const user = await User.findById(req.userId);

        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        if (user.alliance) return res.status(400).json({ success: false, error: 'You are already in an alliance' });

        if (user.credits < CREATE_COST) {
            return res.status(400).json({ success: false, error: `Insufficient Credits. Required: ${CREATE_COST}` });
        }

        // Create Alliance
        const alliance = await Alliance.create({
            name,
            tag,
            leader: user._id,
            members: [user._id]
        });

        // Update User
        user.credits -= CREATE_COST;
        user.alliance = alliance._id;
        user.allianceRole = 'Leader';
        await user.save();

        res.json({ success: true, alliance, message: `Alliance ${name} created!` });

    } catch (error) {
        console.error('Create Alliance Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Alliance name or tag already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Join an alliance
// @route   POST /api/alliance/join
// @access  Private
exports.joinAlliance = async (req, res) => {
    try {
        const { allianceId } = req.body;
        const user = await User.findById(req.userId);
        const alliance = await Alliance.findById(allianceId);

        if (!user || !alliance) return res.status(404).json({ success: false, error: 'User or Alliance not found' });
        if (user.alliance) return res.status(400).json({ success: false, error: 'You are already in an alliance' });

        // Update Alliance
        alliance.members.push(user._id);
        await alliance.save();

        // Update User
        user.alliance = alliance._id;
        user.allianceRole = 'Member';
        await user.save();

        res.json({ success: true, message: `Joined ${alliance.name}!` });

    } catch (error) {
        console.error('Join Alliance Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Leave alliance
// @route   POST /api/alliance/leave
// @access  Private
exports.leaveAlliance = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user || !user.alliance) return res.status(400).json({ success: false, error: 'Not in an alliance' });

        const alliance = await Alliance.findById(user.alliance);
        if (!alliance) {
            // Cleanup user if alliance doesn't exist
            user.alliance = null;
            user.allianceRole = null;
            await user.save();
            return res.json({ success: true, message: 'Alliance not found, cleaned up profile.' });
        }

        // Logic
        alliance.members = alliance.members.filter(m => m.toString() !== user._id.toString());

        if (alliance.members.length === 0) {
            // Delete alliance if empty
            await Alliance.findByIdAndDelete(alliance._id);
        } else if (user.allianceRole === 'Leader') {
            // Transfer leadership to oldest member (first in array usually)
            const newLeaderId = alliance.members[0];
            alliance.leader = newLeaderId;
            // Update new leader's role
            await User.findByIdAndUpdate(newLeaderId, { allianceRole: 'Leader' });
            await alliance.save();
        } else {
            await alliance.save();
        }

        // Update User
        user.alliance = null;
        user.allianceRole = null;
        await user.save();

        res.json({ success: true, message: 'Left alliance.' });

    } catch (error) {
        console.error('Leave Alliance Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get my alliance details
// @route   GET /api/alliance/my-alliance
// @access  Private
exports.getMyAlliance = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.alliance) return res.status(404).json({ success: false, error: 'Not in an alliance' });

        const alliance = await Alliance.findById(user.alliance)
            .populate('members', 'username role allianceRole lastLogin level')
            .populate('leader', 'username');

        res.json({ success: true, alliance });
    } catch (error) {
        console.error('Get My Alliance Error:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Donate to alliance
// @route   POST /api/alliance/donate
// @access  Private
exports.donateResources = async (req, res) => {
    try {
        const { resource, amount } = req.body;
        const user = await User.findById(req.userId);

        if (!user || !user.alliance) return res.status(400).json({ success: false, error: 'Not in an alliance' });
        if (amount <= 0) return res.status(400).json({ success: false, error: 'Invalid amount' });

        if (resource === 'credits') {
            if (user.credits < amount) return res.status(400).json({ success: false, error: 'Insufficient credits' });
            user.credits -= amount;
        } else if (['metal', 'crystal'].includes(resource)) {
            if (user.resources[resource] < amount) return res.status(400).json({ success: false, error: `Insufficient ${resource}` });
            user.resources[resource] -= amount;
        } else {
            return res.status(400).json({ success: false, error: 'Invalid resource type' });
        }

        const alliance = await Alliance.findById(user.alliance);
        if (alliance.resources[resource] !== undefined) {
            alliance.resources[resource] += amount;
        } else {
            // Credits might be at root or under resources object? Model says under resources.
            alliance.resources[resource] = (alliance.resources[resource] || 0) + amount;
        }

        await user.save();
        await alliance.save();

        res.json({ success: true, message: 'Donation successful', allianceResources: alliance.resources, userResources: user.resources });

    } catch (error) {
        console.error('Donation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Siege a sector
// @route   POST /api/alliance/siege-sector
// @access  Private
exports.siegeSector = async (req, res) => {
    try {
        const { targetSectorId, fleetComposition } = req.body;
        const user = await User.findById(req.userId);

        // 1. Validate User & Fleet
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        // Validate fleet (simplified version of combatController logic)
        const playerFleet = [];
        const { getShipById, getEnemyById } = require('../config/gameData');

        for (const [shipId, count] of Object.entries(fleetComposition)) {
            if (count <= 0) continue;
            const userShipCount = user.ships[shipId] || 0;
            // Simplified check: assume frontend handles availability logic (travel, mission, etc)
            // But we should at least check total ownership to prevent cheating
            if (userShipCount < count) {
                return res.status(400).json({ success: false, error: `Not enough ${shipId} ships` });
            }
            const shipData = getShipById(shipId);
            playerFleet.push({ ...shipData, count });
        }

        if (playerFleet.length === 0) return res.status(400).json({ success: false, error: 'No ships selected' });

        // 2. Validate Sector
        const sector = await Sector.findOne({ id: targetSectorId }).populate('ownerAllianceId');
        if (!sector) return res.status(404).json({ success: false, error: 'Sector not found' });

        if (!sector.ownerAllianceId) {
            return res.status(400).json({ success: false, error: 'Cannot siege a neutral sector' });
        }

        if (user.alliance && sector.ownerAllianceId._id.toString() === user.alliance.toString()) {
            return res.status(400).json({ success: false, error: 'Cannot siege your own sector' });
        }

        if (user.currentSector !== targetSectorId) {
            return res.status(400).json({ success: false, error: 'You must be in the sector to siege it' });
        }

        // 3. Generate Enemy (Defense Platform)
        const baseEnemy = getEnemyById('sector_defense_platform');
        // Scale with defense level
        const defenseLevel = sector.defenseLevel || 0;
        const multiplier = 1 + (defenseLevel * 0.1); // +10% per level

        const enemy = {
            ...baseEnemy,
            name: `${sector.name} Defense Platform (Lvl ${defenseLevel})`,
            attack: Math.floor(baseEnemy.attack * multiplier),
            hp: sector.currentDefense, // Enemy HP is the sector's current defense
            maxHP: sector.maxDefense // Just for reference
        };

        // 4. Run Battle
        const { simulateBattle } = require('../utils/battleEngine');
        const battleResult = simulateBattle(playerFleet, enemy, user.talents);

        // 5. Apply Player Results (Losses/Damaged)
        // (Similar to combatController - reusing update logic would be better but keeping inline for now)
        if (battleResult.losses) {
            for (const [shipId, count] of Object.entries(battleResult.losses)) {
                user.ships.set(shipId, Math.max(0, (user.ships.get(shipId) || 0) - count));
            }
        }
        if (battleResult.damaged) {
            for (const [shipId, count] of Object.entries(battleResult.damaged)) {
                user.damagedShips.set(shipId, (user.damagedShips.get(shipId) || 0) + count);
            }
        }
        await user.save();

        // 6. Apply Sector Results
        if (battleResult.winner === 'player') {
            // Calculate damage dealt to sector
            // In `battleEngine`, we don't return total damage dealt explicitly.
            // But if player won, enemy HP dropped <= 0.
            // If enemy won, enemy HP might be reduced.
            // Let's use the remaining HP from the logs or calculate approximate damage?
            // Actually, battleEngine logs have `enemyRemainingHP`.
            // But simpler: just deduct fixed amount or set to 0 if victory?

            // Strategy: The battle simulates the fight against the CURRENT defense. 
            // If player wins, defense is 0 (or close to). 
            // If player loses, defense is reduced by damage dealt.

            // Let's look at battleLog. 
            // battleEngine sets enemyHP locally. 
            // We can infer ending HP.

            // Simplification:
            // Victory = Sector Defense Destroyed (0).
            // Defeat = Sector Defense Reduced by percentage of player power? 
            // `simulateBattle` returns `enemy.hp` at end? No.

            // HACK: We will assume if Player Wins -> Defense = 0.
            // If Player Loses -> Defense reduces by random amount (10-20% of Max) to simulate attrition? 
            // Or better: modify simulateBattle to return `remainingEnemyHP`.

            // For now, let's assume Victory means fully cleared.
            sector.currentDefense = 0;

            // Capture/Liberate Logic
            sector.ownerAllianceId = null;
            sector.currentDefense = sector.maxDefense; // Reset for next claim
            sector.defenseLevel = Math.max(0, sector.defenseLevel - 1); // Degrade defense level
            await sector.save();

            battleResult.message = "Sector Defense Destroyed! Sector is now NEUTRAL.";
        } else {
            // Player lost. Reduce defense slightly?
            const damageDealt = Math.floor(sector.maxDefense * 0.1); // 10% damage
            sector.currentDefense = Math.max(0, sector.currentDefense - damageDealt);
            await sector.save();

            battleResult.message = `Sector Defense held! (Stats: ${sector.currentDefense}/${sector.maxDefense})`;
        }

        res.json({
            success: true,
            battleReport: battleResult,
            user: { ships: user.ships, damagedShips: user.damagedShips },
            sectorStatus: {
                id: sector.id,
                currentDefense: sector.currentDefense,
                owner: sector.ownerAllianceId
            }
        });

    } catch (error) {
        console.error('Siege Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Reinforce sector defense
// @route   POST /api/alliance/reinforce-sector
// @access  Private
exports.reinforceSector = async (req, res) => {
    try {
        const { sectorId, amount } = req.body; // resource amount (Metal)
        const user = await User.findById(req.userId);

        if (!user || !user.alliance) return res.status(400).json({ success: false, error: 'Not in an alliance' });

        const sector = await Sector.findOne({ id: sectorId });
        if (!sector) return res.status(404).json({ success: false, error: 'Sector not found' });

        if (String(sector.ownerAllianceId) !== String(user.alliance)) {
            return res.status(400).json({ success: false, error: 'You can only reinforce your own sectors' });
        }

        if (sector.currentDefense >= sector.maxDefense) {
            return res.status(400).json({ success: false, error: 'Sector defenses are fully operational' });
        }

        // Cost: 1 Metal = 1 HP? 
        // Let's say 1 Metal = 1 HP.
        const needed = sector.maxDefense - sector.currentDefense;
        const toRepair = Math.min(amount, needed);

        if (user.resources.metal < toRepair) {
            return res.status(400).json({ success: false, error: 'Insufficient Metal' });
        }

        user.resources.metal -= toRepair;
        sector.currentDefense += toRepair;

        await user.save();
        await sector.save();

        res.json({
            success: true,
            message: `Reinforced sector with ${toRepair} metal.`,
            sector: { currentDefense: sector.currentDefense, maxDefense: sector.maxDefense },
            user: { resources: user.resources }
        });

    } catch (error) {
        console.error('Reinforce Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Build structure in claimed sector
// @route   POST /api/alliance/build-sector
// @access  Private
exports.buildSectorStructure = async (req, res) => {
    try {
        const { sectorId, structureType } = req.body;
        const user = await User.findById(req.userId);

        if (!user || !user.alliance) return res.status(400).json({ success: false, error: 'Not in an alliance' });

        // Check Permissions (Leader or Officer)
        if (!['Leader', 'Officer'].includes(user.allianceRole)) {
            return res.status(403).json({ success: false, error: 'Only Leaders and Officers can build structures' });
        }

        const sector = await Sector.findOne({ id: sectorId });
        if (!sector) return res.status(404).json({ success: false, error: 'Sector not found' });

        if (String(sector.ownerAllianceId) !== String(user.alliance)) {
            return res.status(400).json({ success: false, error: 'You can only build in your own sectors' });
        }

        const alliance = await Alliance.findById(user.alliance);

        // Define structure costs and effects
        const structures = {
            'defense_grid': { metal: 5000, credits: 2000, maxDefense: 500 },
            'trade_hub': { metal: 3000, credits: 3000 }
        };

        if (!structures[structureType]) {
            return res.status(400).json({ success: false, error: 'Invalid structure type' });
        }

        const cost = structures[structureType];

        // Check if alliance has enough resources
        if (alliance.resources.metal < cost.metal || alliance.resources.credits < cost.credits) {
            return res.status(400).json({
                success: false,
                error: `Insufficient Alliance Resources. Required: ${cost.metal} Metal, ${cost.credits} Credits.`
            });
        }

        // Deduct resources
        alliance.resources.metal -= cost.metal;
        alliance.resources.credits -= cost.credits;

        // Add structure to sector
        if (!sector.structures) sector.structures = [];
        sector.structures.push({
            type: structureType,
            level: 1,
            builtAt: new Date()
        });

        // Apply structure effect
        if (structureType === 'defense_grid') {
            sector.maxDefense += cost.maxDefense;
            sector.currentDefense += cost.maxDefense;
        }

        await alliance.save();
        await sector.save();

        res.json({
            success: true,
            message: `${structureType} built successfully!`,
            sector: {
                id: sector.id,
                structures: sector.structures,
                maxDefense: sector.maxDefense,
                currentDefense: sector.currentDefense
            },
            allianceResources: alliance.resources
        });

    } catch (error) {
        console.error('Build Structure Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
