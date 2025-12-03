// Game Configuration - Building Definitions

const BUILDINGS = {
    SOLAR_CORE: {
        id: 'solar_core',
        name: 'Solar Core',
        description: 'Harnesses stellar energy to power your station',
        type: 'energy',
        cost: {
            metal: 50,
            crystal: 0,
            energy: 0,
            credits: 0,
        },
        production: {
            metal: 0,
            crystal: 0,
            energy: 10, // per hour
            credits: 0,
        },
        icon: 'SOL',
        color: '#ffbf00', // neon-amber
    },
    METAL_EXTRACTOR: {
        id: 'metal_extractor',
        name: 'Metal Extractor',
        description: 'Extracts valuable metals from asteroids',
        type: 'metal',
        cost: {
            metal: 0,
            crystal: 0,
            energy: 30,
            credits: 50,
        },
        production: {
            metal: 15, // per hour
            crystal: 0,
            energy: 0,
            credits: 0,
        },
        icon: 'MET',
        color: '#00f0ff', // neon-cyan
    },
    CRYSTAL_SYNTHESIZER: {
        id: 'crystal_synthesizer',
        name: 'Crystal Synthesizer',
        description: 'Synthesizes rare crystals for advanced technology',
        type: 'crystal',
        cost: {
            metal: 100,
            crystal: 0,
            energy: 50,
            credits: 0,
        },
        production: {
            metal: 0,
            crystal: 8, // per hour
            energy: 0,
            credits: 0,
        },
        icon: 'CRY',
        color: '#ff00ff', // neon-magenta
    },
};

// Grid configuration
const GRID_CONFIG = {
    DEFAULT_SIZE: 8,
    MIN_SIZE: 5,
    MAX_SIZE: 12,
};

// Export all buildings as an array for easy iteration
const getAllBuildings = () => {
    return Object.values(BUILDINGS);
};

// Get building by ID
const getBuildingById = (id) => {
    return Object.values(BUILDINGS).find(building => building.id === id);
};

module.exports = {
    BUILDINGS,
    GRID_CONFIG,
    getAllBuildings,
    getBuildingById,
};
