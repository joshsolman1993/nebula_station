const Sector = require('../models/Sector');
const { GALAXY_MAP } = require('./galaxyGenerator');

const seedGalaxy = async () => {
    try {
        const count = await Sector.countDocuments();

        if (count === 0) {
            console.log('🌌 Galaxy not found in database. Initializing Astral Chart...');

            // Transform GALAXY_MAP to Match Mongoose Schema
            const sectors = Object.values(GALAXY_MAP).map(sector => ({
                id: sector.id,
                name: sector.name,
                x: sector.x,
                y: sector.y,
                type: sector.type, // Already an ID string
                difficulty: sector.difficulty,
                connections: sector.connections,
                ownerAllianceId: null,
                defenseLevel: 0
            }));

            await Sector.insertMany(sectors);
            console.log(`✨ Galaxy Generated! ${sectors.length} sectors mapped.`);
        } else {
            console.log('🌌 Galaxy map loaded.');
        }

    } catch (error) {
        console.error('❌ Galaxy initialization failed:', error);
    }
};

module.exports = seedGalaxy;
