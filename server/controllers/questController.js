const User = require('../models/User');
const Station = require('../models/Station');
const { TUTORIAL_QUESTS, getQuestById } = require('../config/gameData');

// @desc    Claim a quest reward
// @route   POST /api/quests/claim
// @access  Private
exports.claimQuest = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const currentQuestIndex = user.currentQuestIndex || 0;
        if (currentQuestIndex >= TUTORIAL_QUESTS.length) {
            return res.status(400).json({ success: false, error: 'All quests completed' });
        }

        const quest = TUTORIAL_QUESTS[currentQuestIndex];
        let isCompleted = false;

        // Check completion conditions
        switch (quest.type) {
            case 'BUILD':
                // Check if building exists in layout
                const station = await Station.findOne({ userId: req.userId });

                if (!station) {
                    isCompleted = false;
                    break;
                }

                // Station layout is a flat array of objects { x, y, buildingId, ... }
                const hasBuilding = station.layout.some(b => b.buildingId === quest.target);

                if (hasBuilding) isCompleted = true;
                break;

            case 'CRAFT':
                // Check if user owns the ship
                const shipCount = user.ships.get(quest.target) || 0;
                if (shipCount > 0) isCompleted = true;
                break;

            case 'RESEARCH':
                // Check if tech is in completedResearch
                if (user.completedResearch.includes(quest.target)) isCompleted = true;
                break;

            case 'COMBAT_WIN':
                // Check stats.enemiesDefeated
                const defeatedCount = user.stats.enemiesDefeated.get(quest.target) || 0;
                if (defeatedCount > 0) isCompleted = true;
                break;

            default:
                break;
        }

        if (!isCompleted) {
            return res.status(400).json({ success: false, error: 'Quest requirements not met' });
        }

        // Apply Rewards
        if (quest.reward.metal) user.resources.metal += quest.reward.metal;
        if (quest.reward.crystal) user.resources.crystal += quest.reward.crystal;
        if (quest.reward.energy) user.resources.energy += quest.reward.energy;
        if (quest.reward.credits) user.credits += quest.reward.credits;
        if (quest.reward.xp) {
            const { addXp } = require('../utils/levelSystem');
            await addXp(user, quest.reward.xp);
        }
        if (quest.reward.itemId) {
            const existingItem = user.inventory.find(i => i.itemId === quest.reward.itemId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                user.inventory.push({ itemId: quest.reward.itemId, quantity: 1 });
            }
        }

        // Update Progress
        user.completedQuests.push(quest.id);
        user.currentQuestIndex += 1;

        await user.save();

        res.json({
            success: true,
            message: `Quest Complete: ${quest.title}`,
            reward: quest.reward,
            nextQuestIndex: user.currentQuestIndex,
            user: {
                resources: user.resources,
                credits: user.credits,
                inventory: user.inventory,
                completedQuests: user.completedQuests,
                currentQuestIndex: user.currentQuestIndex,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('Quest Claim Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get current quest status
// @route   GET /api/quests/status
// @access  Private
exports.getQuestStatus = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const index = user.currentQuestIndex || 0;
        const completed = index >= TUTORIAL_QUESTS.length;
        const currentQuest = completed ? null : TUTORIAL_QUESTS[index];

        res.json({
            success: true,
            currentQuestIndex: index,
            completedQuests: user.completedQuests,
            currentQuest,
            isAllCompleted: completed
        });
    } catch (error) {
        console.error('Quest Status Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
