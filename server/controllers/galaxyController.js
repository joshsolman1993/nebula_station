const Sector = require('../models/Sector');
const User = require('../models/User');

// Get Galaxy Map (Dynamic from DB)
exports.getGalaxyMap = async (req, res) => {
    try {
        const sectors = await Sector.find()
            .populate('ownerAllianceId', 'name tag color')
            .lean(); // Faster query

        // Transform for frontend if needed, but schema matches 
        // Frontend expects: { sectors: { [id]: { ... } } } dictionary
        const galaxyMap = {};
        sectors.forEach(sector => {
            galaxyMap[sector.id] = {
                ...sector,
                ownerAlliance: sector.ownerAllianceId // Populated object
            };
        });

        res.json({
            success: true,
            map: {
                sectors: galaxyMap
            }
        });
    } catch (error) {
        console.error('❌ Get Galaxy Map Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve astral charts'
        });
    }
};

// Travel to Sector
exports.travelToSector = async (req, res) => {
    try {
        const { targetSectorId } = req.body;
        const userId = req.user.id; // From auth middleware

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check if already traveling
        if (user.travelStatus && user.travelStatus.arrivalTime && new Date(user.travelStatus.arrivalTime) > new Date()) {
            return res.status(400).json({ success: false, error: 'Fleet is already in transit' });
        }

        // Get Current and Target Sector from DB
        const currentSectorData = await Sector.findOne({ id: user.currentSector });
        const targetSectorData = await Sector.findOne({ id: targetSectorId });

        if (!targetSectorData) {
            return res.status(400).json({ success: false, error: 'Invalid sector coordinates' });
        }

        // Validate Connection
        // If currentSectorData is missing (e.g. first run logic mismatch), allow travel from 'sec_alpha' or reset.
        // Assuming seed ran, it should be fine.
        if (currentSectorData && !currentSectorData.connections.includes(targetSectorId)) {
            return res.status(400).json({ success: false, error: 'Sector is not adjacent. Cannot initiate jump.' });
        }

        // Energy Cost
        if (user.resources.energy < 50) {
            return res.status(400).json({ success: false, error: 'Insufficient energy for hyperspace jump (50 required)' });
        }

        // Calculate Travel Time (30 seconds static for now)
        const travelTimeMs = 30 * 1000;
        const arrivalTime = new Date(Date.now() + travelTimeMs);

        // Deduct Energy & Update Status
        user.resources.energy -= 50;
        user.travelStatus = {
            destination: targetSectorId,
            arrivalTime: arrivalTime
        };

        await user.save();

        res.json({
            success: true,
            message: `Initiating jump to ${targetSectorData.name}. Arrival in 30 seconds.`,
            travelStatus: user.travelStatus,
            resources: user.resources
        });

    } catch (error) {
        console.error('Travel Error:', error);
        res.status(500).json({ success: false, error: 'Jump initiation failed' });
    }
};

// Arrive at Sector (Complete Travel)
exports.arriveAtSector = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user.travelStatus || !user.travelStatus.destination) {
            return res.status(400).json({ success: false, error: 'No travel in progress' });
        }

        const now = new Date();
        const arrival = new Date(user.travelStatus.arrivalTime);

        if (now < arrival) {
            const remaining = Math.ceil((arrival - now) / 1000);
            return res.status(400).json({ success: false, error: `Hyperspace travel in progress. ${remaining}s remaining.` });
        }

        // Update Location
        user.currentSector = user.travelStatus.destination;
        user.travelStatus = undefined; // Clear travel status

        await user.save();

        // Fetch new sector details for convenience
        const sector = await Sector.findOne({ id: user.currentSector });

        res.json({
            success: true,
            message: `Fleet arrived at ${sector ? sector.name : user.currentSector}`,
            currentSector: user.currentSector
        });

    } catch (error) {
        console.error('Arrival Error:', error);
        res.status(500).json({ success: false, error: 'Arrival procedure failed' });
    }
};
