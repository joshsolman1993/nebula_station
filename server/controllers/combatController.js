const User = require('../models/User');
const { getShipById, getEnemyById, SHIPS } = require('../config/gameData');
const { simulateBattle } = require('../utils/battleEngine');

// @desc    Attack an enemy
// @route   POST /api/combat/attack
// @access  Private
exports.attackEnemy = async (req, res) => {
    try {
        const { enemyId, fleetComposition } = req.body;
        // fleetComposition: { shipId: count }

        if (!enemyId || !fleetComposition) {
            return res.status(400).json({ success: false, error: 'Missing parameters' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const enemy = getEnemyById(enemyId);
        if (!enemy) {
            return res.status(404).json({ success: false, error: 'Enemy not found' });
        }

        // Validate fleet
        const playerFleet = [];
        for (const [shipId, count] of Object.entries(fleetComposition)) {
            if (count <= 0) continue;

            // Check if user has enough ships
            const userShipCount = user.ships[shipId] || 0;
            if (userShipCount < count) {
                return res.status(400).json({ success: false, error: `Not enough ${shipId} ships` });
            }

            // Check if ships are not damaged (simplified: we assume user selects from available)
            // Ideally we should check available = total - damaged - mission
            // For now, we assume frontend handles "available" count, and backend just checks total ownership.
            // But wait, if they are damaged, they shouldn't be usable.
            // Let's check: available = user.ships.get(shipId) - (user.damagedShips.get(shipId) || 0)
            // Also check active missions? (User.activeMission only tracks one mission, but we might have multiple in future)
            // Currently activeMission locks specific ships.

            if (user.activeMission && user.activeMission.shipId === shipId) {
                // Simplified: If on mission, can't use.
                // But mission locks ALL ships of that type? No, activeMission has shipCount.
                // So available = total - damaged - mission_locked
                const missionLocked = (user.activeMission.shipId === shipId) ? user.activeMission.shipCount : 0;
                const damagedCount = user.damagedShips ? (user.damagedShips.get(shipId) || 0) : 0;
                const available = userShipCount - missionLocked - damagedCount;

                if (available < count) {
                    return res.status(400).json({ success: false, error: `Not enough available ${shipId} (Busy or Damaged)` });
                }
            } else {
                const damagedCount = user.damagedShips ? (user.damagedShips.get(shipId) || 0) : 0;
                const available = userShipCount - damagedCount;
                if (available < count) {
                    return res.status(400).json({ success: false, error: `Not enough available ${shipId} (Damaged)` });
                }
            }

            const shipData = getShipById(shipId);
            playerFleet.push({
                ...shipData,
                count: count
            });
        }

        if (playerFleet.length === 0) {
            return res.status(400).json({ success: false, error: 'No ships selected' });
        }

        // Run Simulation
        const battleResult = simulateBattle(playerFleet, enemy, user.talents);

        // Apply Results
        // 1. Remove destroyed ships
        if (battleResult.losses) {
            for (const [shipId, count] of Object.entries(battleResult.losses)) {
                const current = user.ships.get(shipId);
                user.ships.set(shipId, Math.max(0, current - count));
            }
        }

        // 2. Mark damaged ships
        // Move from "healthy" pool (implicitly) to "damaged" pool
        // Note: Damaged ships are still in user.ships (total count), but added to user.damagedShips
        if (battleResult.damaged) {
            for (const [shipId, count] of Object.entries(battleResult.damaged)) {
                const currentDamaged = user.damagedShips.get(shipId) || 0;
                user.damagedShips.set(shipId, currentDamaged + count);
            }
        }

        // 3. Give Rewards
        if (battleResult.winner === 'player') {
            // Track stats
            if (!user.stats) user.stats = { enemiesDefeated: new Map() };
            if (!user.stats.enemiesDefeated) user.stats.enemiesDefeated = new Map();

            const currentKills = user.stats.enemiesDefeated.get(enemyId) || 0;
            user.stats.enemiesDefeated.set(enemyId, currentKills + 1);

            if (battleResult.rewards.credits) user.credits += battleResult.rewards.credits;
            if (battleResult.rewards.metal) user.resources.metal += battleResult.rewards.metal;
            if (battleResult.rewards.crystal) user.resources.crystal += battleResult.rewards.crystal;

            // Award XP for victory (e.g., 50 XP base + 10 per enemy level/difficulty?)
            // For now, let's say 50 XP fixed or based on enemy difficulty.
            // Enemy object isn't fully available here, but we have enemyId.
            // Let's fetch enemy data again or use a fixed amount.
            const enemyData = getEnemyById(enemyId);
            const xpReward = enemyData ? (enemyData.attack * 2) : 50; // Simple formula

            const { addXp } = require('../utils/levelSystem');
            await addXp(user, xpReward);

            if (battleResult.rewards.artifact) {
                const artifact = battleResult.rewards.artifact;
                const existingItem = user.inventory.find(i => i.itemId === artifact.id);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    user.inventory.push({ itemId: artifact.id, quantity: 1 });
                }
            }
        }

        await user.save();

        res.json({
            success: true,
            battleReport: battleResult,
            user: {
                resources: user.resources,
                credits: user.credits,
                ships: user.ships,
                damagedShips: user.damagedShips,
                inventory: user.inventory
            }
        });

    } catch (error) {
        console.error('Combat Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Repair a ship
// @route   POST /api/combat/repair
// @access  Private
exports.repairShip = async (req, res) => {
    try {
        const { shipId } = req.body;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const damagedCount = user.damagedShips.get(shipId) || 0;
        if (damagedCount <= 0) {
            return res.status(400).json({ success: false, error: 'No damaged ships of this type' });
        }

        const ship = getShipById(shipId);
        // Repair cost: 20% of original cost
        const repairCost = {
            metal: Math.floor(ship.cost.metal * 0.2),
            crystal: Math.floor(ship.cost.crystal * 0.2),
            energy: Math.floor(ship.cost.energy * 0.2),
            credits: Math.floor(ship.cost.credits * 0.2),
        };

        // Check resources
        if (user.resources.metal < repairCost.metal ||
            user.resources.crystal < repairCost.crystal ||
            user.resources.energy < repairCost.energy ||
            user.credits < repairCost.credits) {
            return res.status(400).json({ success: false, error: 'Not enough resources for repair' });
        }

        // Deduct resources
        user.resources.metal -= repairCost.metal;
        user.resources.crystal -= repairCost.crystal;
        user.resources.energy -= repairCost.energy;
        user.credits -= repairCost.credits;

        // Repair 1 ship
        user.damagedShips.set(shipId, damagedCount - 1);
        if (user.damagedShips.get(shipId) === 0) {
            user.damagedShips.delete(shipId);
        }

        await user.save();

        res.json({
            success: true,
            message: `${ship.name} repaired!`,
            user: {
                resources: user.resources,
                credits: user.credits,
                damagedShips: user.damagedShips
            }
        });

    } catch (error) {
        console.error('Repair Error:', error);
    }
};

// @desc    Get available enemies based on current sector
// @route   GET /api/combat/enemies
// @access  Private
exports.getAvailableEnemies = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const { getSectorById, SECTOR_TYPES } = require('../utils/galaxyGenerator');
        const { ENEMIES } = require('../config/gameData');

        const currentSectorId = user.currentSector || 'sec_alpha';
        const sector = getSectorById(currentSectorId);

        if (!sector) {
            return res.json({ success: true, enemies: [] });
        }

        let allowedEnemies = [];

        switch (sector.type) {
            case SECTOR_TYPES.SAFE_HAVEN.id:
                allowedEnemies = ['training_drone'];
                break;
            case SECTOR_TYPES.ASTEROID_FIELD.id:
                allowedEnemies = ['pirate_scout', 'pirate_frigate', 'drone_swarm'];
                break;
            case SECTOR_TYPES.NEBULA.id:
                allowedEnemies = ['crystal_entity', 'energy_being'];
                break;
            case SECTOR_TYPES.HIGH_ORBIT.id:
                allowedEnemies = ['pirate_scout', 'mercenary'];
                break;
            case SECTOR_TYPES.VOID.id:
                allowedEnemies = ['void_leviathan', 'elite_pirate'];
                break;
            default:
                allowedEnemies = ['pirate_scout'];
        }

        const enemies = ENEMIES.filter(e => allowedEnemies.includes(e.id));

        res.json({
            success: true,
            enemies,
            sector: {
                id: sector.id,
                name: sector.name,
                type: sector.type,
                difficulty: sector.difficulty
            }
        });

    } catch (error) {
        console.error('Get Enemies Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
