// Frontend Game Data - mirrors backend config

export interface Building {
    id: string;
    name: string;
    description: string;
    type: string;
    cost: {
        metal: number;
        crystal: number;
        energy: number;
        credits: number;
    };
    production: {
        metal: number;
        crystal: number;
        energy: number;
        credits: number;
    };
    icon: string;
    color: string;
    requiredTech?: string;
}

export const BUILDINGS: Building[] = [
    {
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
            energy: 10,
            credits: 0,
        },
        icon: 'SOL',
        color: '#ffbf00',
    },
    {
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
            metal: 15,
            crystal: 0,
            energy: 0,
            credits: 0,
        },
        icon: 'MET',
        color: '#00f0ff',
    },
    {
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
            crystal: 8,
            energy: 0,
            credits: 0,
        },
        icon: 'CRY',
        color: '#ff00ff',
    },
    {
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
            energy: -10,
            credits: 0,
        },
        icon: 'LAB',
        color: '#ffffff',
    },
    {
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
            metal: 40,
            crystal: 0,
            energy: -20,
            credits: 0,
        },
        icon: 'FND',
        color: '#ff4444',
        requiredTech: 'advanced_metallurgy',
    },
];

export interface Ship {
    id: string;
    name: string;
    description: string;
    cost: {
        metal: number;
        crystal: number;
        energy: number;
        credits: number;
    };
    speedModifier: number;
    capacityModifier: number;
    icon: string;
    color: string;
    requiredTech?: string;
    attack?: number;
    defense?: number;
}

export const SHIPS: Ship[] = [
    {
        id: 'scout_drone',
        name: 'Scout Drone',
        description: 'Fast and agile reconnaissance vessel',
        cost: {
            metal: 200,
            crystal: 0,
            energy: 50,
            credits: 0,
        },
        speedModifier: 1.5,
        capacityModifier: 1.0,
        icon: '🛸',
        color: '#00f0ff',
        attack: 5,
        defense: 20,
    },
    {
        id: 'mining_barge',
        name: 'Mining Barge',
        description: 'Heavy cargo vessel with enhanced storage',
        cost: {
            metal: 500,
            crystal: 100,
            energy: 0,
            credits: 0,
        },
        speedModifier: 0.8,
        capacityModifier: 2.0,
        icon: '🚛',
        color: '#ff00ff',
        attack: 2,
        defense: 100,
    },
    {
        id: 'explorer_ship',
        name: 'Explorer Ship',
        description: 'Advanced vessel equipped with hyperdrive for deep space missions',
        cost: {
            metal: 1000,
            crystal: 500,
            energy: 200,
            credits: 0,
        },
        speedModifier: 2.5,
        capacityModifier: 1.5,
        icon: '🚀',
        color: '#ffbf00',
        requiredTech: 'hyperdrive_theory',
        attack: 15,
        defense: 50,
    },
];

export interface Artifact {
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    slot: 'tool' | 'core';
    effect: {
        type: string;
        resource?: string;
        value: number;
    };
    icon: string;
}

export const ARTIFACTS: Artifact[] = [
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

export interface Enemy {
    id: string;
    name: string;
    description: string;
    attack: number;
    hp: number;
    reward: {
        credits?: { min: number; max: number };
        metal?: { min: number; max: number };
        crystal?: { min: number; max: number };
        artifactChance?: number;
    };
    difficulty: 'Easy' | 'Medium' | 'Hard';
    icon: string;
}

export const ENEMIES: Enemy[] = [
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

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'BUILD' | 'CRAFT' | 'RESEARCH' | 'COMBAT_WIN';
    target: string;
    reward: {
        metal?: number;
        crystal?: number;
        energy?: number;
        credits?: number;
        xp?: number;
        itemId?: string;
    };
}

export const TUTORIAL_QUESTS: Quest[] = [
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

export const SECTOR_STRUCTURES = [
    {
        id: 'warp_gate',
        name: 'Warp Gate',
        description: 'Reduces travel time to this sector by 50% for alliance members.',
        cost: { metal: 5000, credits: 2000 },
        maxCount: 1,
        icon: '🌀',
        type: 'utility'
    },
    {
        id: 'defense_grid',
        name: 'Defense Grid',
        description: 'Increases sector maximum defense by 500.',
        cost: { metal: 8000, crystal: 2000 },
        effect: { type: 'defense_boost', value: 500 },
        maxCount: 1,
        icon: '🛡️',
        type: 'defense'
    },
    {
        id: 'trade_hub',
        name: 'Trade Hub',
        description: 'Increases tax revenue from this sector by 20%.',
        cost: { credits: 5000 },
        effect: { type: 'tax_bonus', value: 0.20 },
        maxCount: 1,
        icon: '💰',
        type: 'economy'
    }
];


export interface Mission {
    id: string;
    name: string;
    description: string;
    duration: number;
    baseReward: {
        metal: number;
        crystal: number;
        energy: number;
    };
    icon: string;
    difficulty: string;
    color: string;
}

export const MISSIONS: Mission[] = [
    {
        id: 'asteroid_belt',
        name: 'Asteroid Belt Run',
        description: 'Mine valuable metals from nearby asteroids',
        duration: 300, // 5 minutes
        baseReward: {
            metal: 150,
            crystal: 0,
            energy: 0,
        },
        icon: '☄️',
        difficulty: 'Easy',
        color: '#00f0ff',
    },
    {
        id: 'nebula_gas',
        name: 'Nebula Gas Collection',
        description: 'Harvest rare crystals from nebula clouds',
        duration: 600, // 10 minutes
        baseReward: {
            metal: 0,
            crystal: 80,
            energy: 0,
        },
        icon: '🌌',
        difficulty: 'Medium',
        color: '#ff00ff',
    },
];

export interface Technology {
    id: string;
    name: string;
    description: string;
    cost: {
        metal: number;
        crystal: number;
        energy: number;
        credits: number;
    };
    effect: {
        type: string;
        bonus?: string;
        value?: number;
        target?: string;
    };
    icon: string;
    color: string;
}

export const TECHNOLOGIES: Technology[] = [
    {
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
            value: 0.1,
        },
        icon: '⚡',
        color: '#ffbf00',
    },
    {
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
    {
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
];

export const getBuildingById = (id: string): Building | undefined => {
    return BUILDINGS.find((building) => building.id === id);
};

export const getShipById = (id: string): Ship | undefined => {
    return SHIPS.find((ship) => ship.id === id);
};

export const getMissionById = (id: string): Mission | undefined => {
    return MISSIONS.find((mission) => mission.id === id);
};

export const getTechnologyById = (id: string): Technology | undefined => {
    return TECHNOLOGIES.find((tech) => tech.id === id);
};
