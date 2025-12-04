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
    RESEARCH_LAB: {
        id: 'research_lab',
        name: 'Research Lab',
        description: 'Conducts advanced research to unlock new technologies',
        type: 'research',
        cost: {
            metal: 200,
            crystal: 100,
            energy: 50,
            credits: 0,
        },
        production: {
            metal: 0,
            crystal: 0,
            energy: -10, // Consumes energy
            credits: 0,
        },
        icon: 'LAB',
        color: '#ffffff', // white
    },
    ALLOY_FOUNDRY: {
        id: 'alloy_foundry',
        name: 'Alloy Foundry',
        description: 'Advanced facility for high-grade metal production',
        type: 'metal',
        cost: {
            metal: 500,
            crystal: 200,
            energy: 100,
            credits: 0,
        },
        production: {
            metal: 40, // High production
            crystal: 0,
            energy: -20,
            credits: 0,
        },
        icon: 'FND',
        color: '#ff4444', // red
        requiredTech: 'advanced_metallurgy',
    },
};

// Grid configuration
const GRID_CONFIG = {
    DEFAULT_SIZE: 8,
    MIN_SIZE: 5,
    MAX_SIZE: 12,
};

// Ships configuration
const SHIPS = {
    SCOUT_DRONE: {
        id: 'scout_drone',
        name: 'Scout Drone',
        description: 'Fast and agile reconnaissance vessel',
        cost: {
            metal: 200,
            crystal: 0,
            energy: 50,
            credits: 0,
        },
        speedModifier: 1.5, // 1.5x faster missions
        capacityModifier: 1.0, // Normal capacity
        icon: '🛸',
        color: '#00f0ff', // neon-cyan
    },
    MINING_BARGE: {
        id: 'mining_barge',
        name: 'Mining Barge',
        description: 'Heavy cargo vessel with enhanced storage',
        cost: {
            metal: 500,
            crystal: 100,
            energy: 0,
            credits: 0,
        },
        speedModifier: 0.8, // 20% slower
        capacityModifier: 2.0, // 2x capacity
        icon: '🚛',
        color: '#ff00ff', // neon-magenta
    },
    EXPLORER_SHIP: {
        id: 'explorer_ship',
        name: 'Explorer Ship',
        description: 'Advanced vessel equipped with hyperdrive for deep space missions',
        cost: {
            metal: 1000,
            crystal: 500,
            energy: 200,
            credits: 0,
        },
        speedModifier: 2.5, // Very fast
        capacityModifier: 1.5, // Good capacity
        icon: '🚀',
        color: '#ffbf00', // neon-amber
        requiredTech: 'hyperdrive_theory',
    },
};

// Missions configuration
const MISSIONS = {
    ASTEROID_BELT: {
        id: 'asteroid_belt',
        name: 'Asteroid Belt Run',
        description: 'Mine valuable metals from nearby asteroids',
        duration: 300, // 5 minutes in seconds
        baseReward: {
            metal: 150,
            crystal: 0,
            energy: 0,
        },
        icon: '☄️',
        difficulty: 'Easy',
        color: '#00f0ff',
    },
    NEBULA_GAS: {
        id: 'nebula_gas',
        name: 'Nebula Gas Collection',
        description: 'Harvest rare crystals from nebula clouds',
        duration: 600, // 10 minutes in seconds
        baseReward: {
            metal: 0,
            crystal: 80,
            energy: 0,
        },
        icon: '🌌',
        difficulty: 'Medium',
        color: '#ff00ff',
    },
};

// Technologies configuration
const TECHNOLOGIES = {
    ENERGY_GRID_OPTIMIZATION: {
        id: 'energy_grid_optimization',
        name: 'Energy Grid Optimization',
        description: 'Improves energy distribution efficiency by 10%',
        cost: {
            metal: 100,
            crystal: 100,
            energy: 0,
            credits: 0,
        },
        effect: {
            type: 'passive',
            bonus: 'energy_production',
            value: 0.10, // +10%
        },
        icon: '⚡',
        color: '#ffbf00',
    },
    ADVANCED_METALLURGY: {
        id: 'advanced_metallurgy',
        name: 'Advanced Metallurgy',
        description: 'Unlocks the Alloy Foundry for superior metal production',
        cost: {
            metal: 300,
            crystal: 0,
            energy: 200,
            credits: 0,
        },
        effect: {
            type: 'unlock',
            target: 'alloy_foundry',
        },
        icon: '🏗️',
        color: '#00f0ff',
    },
    HYPERDRIVE_THEORY: {
        id: 'hyperdrive_theory',
        name: 'Hyperdrive Theory',
        description: 'Unlocks the Explorer Ship for deep space travel',
        cost: {
            metal: 0,
            crystal: 500,
            energy: 300,
            credits: 0,
        },
        effect: {
            type: 'unlock',
            target: 'explorer_ship',
        },
        icon: '🚀',
        color: '#ff00ff',
    },
};

// Export all buildings as an array for easy iteration
const getAllBuildings = () => {
    return Object.values(BUILDINGS);
};

// Get building by ID
const getBuildingById = (id) => {
    return Object.values(BUILDINGS).find(building => building.id === id);
};

// Export all ships as an array
const getAllShips = () => {
    return Object.values(SHIPS);
};

// Get ship by ID
const getShipById = (id) => {
    return Object.values(SHIPS).find(ship => ship.id === id);
};

// Export all missions as an array
const getAllMissions = () => {
    return Object.values(MISSIONS);
};

// Get mission by ID
const getMissionById = (id) => {
    return Object.values(MISSIONS).find(mission => mission.id === id);
};

// Export all technologies as an array
const getAllTechnologies = () => {
    return Object.values(TECHNOLOGIES);
};

// Get technology by ID
const getTechnologyById = (id) => {
    return Object.values(TECHNOLOGIES).find(tech => tech.id === id);
};

module.exports = {
    BUILDINGS,
    SHIPS,
    MISSIONS,
    TECHNOLOGIES,
    GRID_CONFIG,
    getAllBuildings,
    getBuildingById,
    getAllShips,
    getShipById,
    getAllMissions,
    getMissionById,
    getAllTechnologies,
    getTechnologyById,
};
