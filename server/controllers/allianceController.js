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
