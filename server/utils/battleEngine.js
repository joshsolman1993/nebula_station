const { ARTIFACTS } = require('../config/gameData');

/**
 * Simulates a battle between a player's fleet and an enemy.
 * 
 * @param {Array} playerFleet - Array of ship objects with count and stats.
 *                              Example: [{ id: 'scout_drone', count: 5, attack: 5, defense: 20 }]
 * @param {Object} enemy - Enemy object with stats.
 *                         Example: { id: 'pirate', attack: 10, hp: 50, reward: {...} }
 * @param {Map} talents - User talents map (optional)
 * @returns {Object} Battle result { winner, log, rewards, losses, damaged }
 */
const simulateBattle = (playerFleet, enemy, talents = null) => {
    const log = [];
    let enemyHP = enemy.hp;

    // Calculate Talent Bonuses
    let attackBonus = 0;
    let hpBonus = 0;
    let lootBonus = 0;

    if (talents) {
        if (talents.get('targeting_systems')) {
            attackBonus = talents.get('targeting_systems') * 0.05;
        }
        if (talents.get('reinforced_hulls')) {
            hpBonus = talents.get('reinforced_hulls') * 0.10;
        }
        if (talents.get('scavenger')) {
            lootBonus = talents.get('scavenger') * 0.15;
        }
    }

    // Calculate total player stats
    let playerTotalHP = 0;
    let playerTotalAttack = 0;
    const playerShips = []; // Working copy for damage distribution

    playerFleet.forEach(ship => {
        // Apply HP Bonus
        const shipDefense = Math.floor(ship.defense * (1 + hpBonus));
        const totalShipHP = shipDefense * ship.count;

        playerTotalHP += totalShipHP;

        // Apply Attack Bonus
        const shipAttack = Math.floor(ship.attack * (1 + attackBonus));
        playerTotalAttack += shipAttack * ship.count;

        // Push individual ships for granular damage tracking (simplified)
        // Actually, let's track damage by ship type group to keep it manageable
        playerShips.push({
            ...ship,
            defense: shipDefense, // Store modified stats
            attack: shipAttack,
            currentHP: totalShipHP, // Total HP pool for this group
            maxHP: totalShipHP
        });
    });

    log.push({ type: 'battle_start', message: `Battle Started! Fleet Power: ${playerTotalAttack} | Enemy Power: ${enemy.attack}`, data: { playerPower: playerTotalAttack, enemyPower: enemy.attack } });
    if (attackBonus > 0) log.push({ type: 'bonus', message: `Command Bonus: +${(attackBonus * 100).toFixed(0)}% Attack`, data: { bonusType: 'attack', value: attackBonus } });
    if (hpBonus > 0) log.push({ type: 'bonus', message: `Command Bonus: +${(hpBonus * 100).toFixed(0)}% Hull Integrity`, data: { bonusType: 'hp', value: hpBonus } });

    log.push({ type: 'enemy_intro', message: `Enemy: ${enemy.name} (HP: ${enemy.hp})`, data: { enemyName: enemy.name, enemyHP: enemy.hp } });

    let round = 1;
    const maxRounds = 10;
    let winner = null;

    while (round <= maxRounds && enemyHP > 0 && playerTotalHP > 0) {
        log.push({ type: 'round_start', message: `--- Round ${round} ---`, data: { round } });

        // Player attacks
        // Variance: +/- 20%
        const playerDamage = Math.floor(playerTotalAttack * (0.8 + Math.random() * 0.4));
        enemyHP -= playerDamage;
        log.push({
            type: 'damage',
            source: 'player',
            target: 'enemy',
            amount: playerDamage,
            message: `Fleet deals ${playerDamage} damage to ${enemy.name}.`,
            data: { enemyRemainingHP: Math.max(0, enemyHP) }
        });

        if (enemyHP <= 0) {
            winner = 'player';
            break;
        }

        // Enemy attacks
        const enemyDamage = Math.floor(enemy.attack * (0.8 + Math.random() * 0.4));

        // Distribute damage to player ships
        const targetGroupIndex = Math.floor(Math.random() * playerShips.length);
        const targetGroup = playerShips[targetGroupIndex];

        // Apply damage to the group
        targetGroup.currentHP -= enemyDamage;
        playerTotalHP -= enemyDamage;

        log.push({
            type: 'damage',
            source: 'enemy',
            target: 'player',
            amount: enemyDamage,
            message: `${enemy.name} deals ${enemyDamage} damage to ${targetGroup.name}s.`,
            data: { targetGroup: targetGroup.name, playerRemainingHP: Math.max(0, playerTotalHP) }
        });

        if (playerTotalHP <= 0) {
            winner = 'enemy';
            break;
        }

        round++;
    }

    if (!winner) {
        winner = 'enemy'; // Retreat/Draw counts as loss for now
        log.push({ type: 'retreat', message: 'Battle limit reached. Fleet retreats.' });
    }

    // Calculate Losses and Damage
    const losses = {}; // shipId -> count (destroyed)
    const damaged = {}; // shipId -> count (damaged but surviving)

    playerShips.forEach(group => {
        if (group.currentHP < group.maxHP) {
            const singleShipHP = group.defense;
            const remainingHP = Math.max(0, group.currentHP);

            // Calculate how many full ships remain
            const fullShipsRemaining = Math.ceil(remainingHP / singleShipHP);
            const shipsLost = group.count - fullShipsRemaining;

            if (shipsLost > 0) {
                losses[group.id] = shipsLost;
                log.push({ type: 'destruction', message: `${shipsLost}x ${group.name} destroyed!`, data: { ship: group.name, count: shipsLost } });
            }

            // Check for damaged ships among survivors
            const destroyedCount = Math.floor((group.maxHP - remainingHP) / singleShipHP);
            const isOneDamaged = (group.maxHP - remainingHP) % singleShipHP > 0;

            if (destroyedCount > 0) {
                losses[group.id] = destroyedCount;
            }

            if (isOneDamaged && (group.count - destroyedCount) > 0) {
                damaged[group.id] = (damaged[group.id] || 0) + 1;
                log.push({ type: 'heavy_damage', message: `1x ${group.name} sustained heavy damage.`, data: { ship: group.name } });
            }
        }
    });

    // Generate Rewards
    const rewards = {
        credits: 0,
        metal: 0,
        crystal: 0,
        artifact: null
    };

    if (winner === 'player') {
        log.push({ type: 'victory', message: 'VICTORY!' });

        // Resource rewards
        if (enemy.reward.credits) {
            rewards.credits = Math.floor(Math.random() * (enemy.reward.credits.max - enemy.reward.credits.min + 1)) + enemy.reward.credits.min;
        }
        if (enemy.reward.metal) {
            rewards.metal = Math.floor(Math.random() * (enemy.reward.metal.max - enemy.reward.metal.min + 1)) + enemy.reward.metal.min;
        }
        if (enemy.reward.crystal) {
            rewards.crystal = Math.floor(Math.random() * (enemy.reward.crystal.max - enemy.reward.crystal.min + 1)) + enemy.reward.crystal.min;
        }

        // Artifact chance
        // Apply Scavenger Bonus
        let artifactChance = enemy.reward.artifactChance || 0;
        if (lootBonus > 0) {
            artifactChance *= (1 + lootBonus);
            log.push({ type: 'bonus', message: `Scavenger Bonus: Loot Chance increased to ${(artifactChance * 100).toFixed(1)}%`, data: { bonusType: 'loot', value: lootBonus } });
        }

        if (artifactChance > 0 && Math.random() < artifactChance) {
            // Pick random artifact
            const artifact = ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)];
            rewards.artifact = artifact;
            log.push({ type: 'loot', message: `Artifact Found: ${artifact.name}`, data: { artifact: artifact } });
        }
    } else {
        log.push({ type: 'defeat', message: 'DEFEAT!' });
    }

    return {
        winner,
        log,
        rewards,
        losses,
        damaged
    };
};

module.exports = { simulateBattle };
