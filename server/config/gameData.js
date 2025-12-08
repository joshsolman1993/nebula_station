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
        attack: 5,
        defense: 20,
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
        attack: 2,
        defense: 100,
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
        attack: 15,
        defense: 50,
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
        requiredSectorType: 'ASTEROID_FIELD'
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
        requiredSectorType: 'NEBULA'
    },
    VOID_SALVAGE: {
        id: 'void_salvage',
        name: 'Void Salvage',
        description: 'Salvage ancient technology from the void',
        duration: 1200, // 20 minutes
        baseReward: {
            metal: 100,
            crystal: 100,
            energy: 0,
            credits: 50
        },
        icon: '💀',
        difficulty: 'Hard',
        color: '#ff4444',
        requiredSectorType: 'VOID'
    },
    SAFE_PATROL: {
        id: 'safe_patrol',
        name: 'Sector Patrol',
        description: 'Patrol the safe haven for minor threats',
        duration: 120, // 2 minutes
        baseReward: {
            credits: 20
        },
        icon: '🛡️',
        difficulty: 'Easy',
        color: '#4ade80',
        requiredSectorType: 'SAFE_HAVEN'
    }
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

const ARTIFACTS = [
    {
        id: 'rusty_mining_drill',
        name: 'Rusty Mining Drill',
        description: 'An old but reliable drill that slightly improves metal extraction.',
        rarity: 'common',
        slot: 'tool',
        effect: { type: 'production_bonus', resource: 'metal', value: 0.05 },
        icon: 'DRILL'
    },
    {
        id: 'crystal_focus_lens',
        name: 'Crystal Focus Lens',
        description: 'A precision lens that enhances crystal resonance.',
        rarity: 'rare',
        slot: 'tool',
        effect: { type: 'production_bonus', resource: 'crystal', value: 0.10 },
        icon: 'LENS'
    },
    {
        id: 'void_engine_prototype',
        name: 'Void Engine Prototype',
        description: 'Experimental engine tech that warps space to reduce travel time.',
        rarity: 'legendary',
        slot: 'core',
        effect: { type: 'mission_duration', value: 0.10 },
        icon: 'ENGINE'
    },
    {
        id: 'efficiency_module_mk1',
        name: 'Efficiency Module Mk1',
        description: 'Standard issue module that optimizes energy usage.',
        rarity: 'common',
        slot: 'core',
        effect: { type: 'production_bonus', resource: 'energy', value: 0.05 },
        icon: 'CHIP'
    },
    {
        id: 'quantum_scanner',
        name: 'Quantum Scanner',
        description: 'Advanced sensors that locate richer mineral deposits.',
        rarity: 'epic',
        slot: 'tool',
        effect: { type: 'production_bonus', resource: 'metal', value: 0.15 },
        icon: 'SCANNER'
    }
];

const ENEMIES = [
    {
        id: 'space_pirate_skiff',
        name: 'Space Pirate Skiff',
        description: 'A lightly armed vessel used by raiders.',
        attack: 10,
        hp: 50,
        reward: {
            credits: { min: 50, max: 150 },
            metal: { min: 100, max: 300 }
        },
        difficulty: 'Easy',
        icon: '☠️'
    },
    {
        id: 'alien_drone_swarm',
        name: 'Alien Drone Swarm',
        description: 'A hive mind of automated defense drones.',
        attack: 30,
        hp: 100,
        reward: {
            crystal: { min: 50, max: 200 },
            artifactChance: 0.1
        },
        difficulty: 'Medium',
        icon: '👾'
    },
    {
        id: 'void_leviathan',
        name: 'Void Leviathan',
        description: 'A massive biological entity living in deep space.',
        attack: 80,
        hp: 500,
        reward: {
            credits: { min: 500, max: 2000 },
            artifactChance: 0.5
        },
        difficulty: 'Hard',
        icon: '🐉'
    }
];

const TUTORIAL_QUESTS = [
    {
        id: 'q_build_power',
        title: 'Powering Up',
        description: 'Build your first Solar Core to generate energy.',
        type: 'BUILD',
        target: 'solar_core',
        reward: { metal: 200 }
    },
    {
        id: 'q_mine_metal',
        title: 'Extraction',
        description: 'Build a Metal Extractor.',
        type: 'BUILD',
        target: 'metal_extractor',
        reward: { energy: 100 }
    },
    {
        id: 'q_craft_drone',
        title: 'Eyes in the Sky',
        description: 'Craft a Scout Drone in the Hangar.',
        type: 'CRAFT',
        target: 'scout_drone',
        reward: { xp: 50, credits: 10 }
    },
    {
        id: 'q_research_grid',
        title: 'Knowledge is Power',
        description: "Research 'Energy Grid Optimization'.",
        type: 'RESEARCH',
        target: 'energy_grid_optimization',
        reward: { metal: 500, crystal: 500 }
    },
    {
        id: 'q_first_blood',
        title: 'Defend the Station',
        description: 'Defeat a Space Pirate Skiff in Operations.',
        type: 'COMBAT_WIN',
        target: 'space_pirate_skiff',
        reward: { itemId: 'rusty_mining_drill' }
    }
];

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
    ARTIFACTS,
    getArtifactById: (id) => ARTIFACTS.find(a => a.id === id),
    ENEMIES,
    getEnemyById: (id) => ENEMIES.find(e => e.id === id),
    TUTORIAL_QUESTS,
    getQuestById: (id) => TUTORIAL_QUESTS.find(q => q.id === id),
    TALENTS: {
        INDUSTRIALIST: [
            {
                id: 'efficient_mining',
                name: 'Efficient Mining',
                description: '+5% Metal & Crystal Production per level',
                branch: 'INDUSTRIALIST',
                tier: 1,
                maxLevel: 5,
                effect: { type: 'production_bonus', value: 0.05 }
            },
            {
                id: 'cargo_optimization',
                name: 'Cargo Optimization',
                description: '+10% Ship Cargo Capacity per level',
                branch: 'INDUSTRIALIST',
                tier: 2,
                maxLevel: 5,
                effect: { type: 'cargo_bonus', value: 0.10 }
            },
            {
                id: 'master_builder',
                name: 'Master Builder',
                description: '-10% Building Cost per level',
                branch: 'INDUSTRIALIST',
                tier: 3,
                maxLevel: 5,
                effect: { type: 'build_cost_reduction', value: 0.10 }
            }
        ],
        WARLORD: [
            {
                id: 'targeting_systems',
                name: 'Targeting Systems',
                description: '+5% Ship Attack Power per level',
                branch: 'WARLORD',
                tier: 1,
                maxLevel: 5,
                effect: { type: 'attack_bonus', value: 0.05 }
            },
            {
                id: 'reinforced_hulls',
                name: 'Reinforced Hulls',
                description: '+10% Ship HP per level',
                branch: 'WARLORD',
                tier: 2,
                maxLevel: 5,
                effect: { type: 'hp_bonus', value: 0.10 }
            },
            {
                id: 'scavenger',
                name: 'Scavenger',
                description: '+15% Loot Chance in Combat per level',
                branch: 'WARLORD',
                tier: 3,
                maxLevel: 5,
                effect: { type: 'loot_bonus', value: 0.15 }
            }
        ],
        SCIENTIST: [
            {
                id: 'overclocking',
                name: 'Overclocking',
                description: '+5% Energy Production per level',
                branch: 'SCIENTIST',
                tier: 1,
                maxLevel: 5,
                effect: { type: 'energy_bonus', value: 0.05 }
            },
            {
                id: 'neural_network',
                name: 'Neural Network',
                description: '+10% XP Gain per level',
                branch: 'SCIENTIST',
                tier: 2,
                maxLevel: 5,
                effect: { type: 'xp_bonus', value: 0.10 }
            },
            {
                id: 'eureka_moment',
                name: 'Eureka Moment',
                description: '-10% Research Cost per level',
                branch: 'SCIENTIST',
                tier: 3,
                maxLevel: 5,
                effect: { type: 'research_cost_reduction', value: 0.10 }
            }
        ]
    },
    getTalentById: (id) => {
        const allTalents = [
            ...module.exports.TALENTS.INDUSTRIALIST,
            ...module.exports.TALENTS.WARLORD,
            ...module.exports.TALENTS.SCIENTIST
        ];
        return allTalents.find(t => t.id === id);
    }
};
