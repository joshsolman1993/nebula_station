const User = require('../models/User');

const XP_PER_LEVEL_BASE = 100;
const XP_MULTIPLIER = 1.5; // Each level requires 50% more XP than the previous

/**
 * Calculate XP required for a specific level
 * Formula: Base * (Multiplier ^ (Level - 1))
 */
const getXpForLevel = (level) => {
    return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER, level - 1));
};

/**
 * Add XP to a user and handle level ups
 * @param {Object} user - Mongoose User document
 * @param {Number} amount - Amount of XP to add
 * @returns {Object} Result { leveledUp: boolean, newLevel: number, talentPointsGained: number }
 */
const addXp = async (user, amount) => {
    // Apply Scientist "Neural Network" bonus if applicable
    // We need to check if user has the talent. 
    // Since we don't have easy access to gameData here without circular deps or complex logic,
    // let's assume the caller handles the bonus OR we check user.talents directly.
    // User.talents is a Map: talentId -> level.

    let bonusMultiplier = 1;
    if (user.talents && user.talents.get('neural_network')) {
        const level = user.talents.get('neural_network');
        // +10% per level
        bonusMultiplier += (level * 0.10);
    }

    const adjustedAmount = Math.floor(amount * bonusMultiplier);
    user.xp += adjustedAmount;

    let leveledUp = false;
    let talentPointsGained = 0;

    // Check for level up
    // We loop in case they gain enough XP for multiple levels
    while (true) {
        const xpRequired = getXpForLevel(user.level);
        if (user.xp >= xpRequired) {
            user.xp -= xpRequired;
            user.level += 1;
            user.talentPoints += 1;
            talentPointsGained += 1;
            leveledUp = true;
        } else {
            break;
        }
    }

    return {
        leveledUp,
        newLevel: user.level,
        talentPointsGained
    };
};

module.exports = {
    addXp,
    getXpForLevel
};
