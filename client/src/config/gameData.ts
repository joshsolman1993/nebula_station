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
    },
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
