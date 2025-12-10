// Game Type Definitions

export interface User {
    id: string;
    username: string;
    email: string;
    stationName: string;
    level: number;
    experience: number;
    resources: Resources;
    lastLogin: Date;
    createdAt: Date;
    role: 'user' | 'admin';
    isBanned?: boolean;
    banReason?: string;
    isMuted?: boolean;
    muteExpiresAt?: Date;
}

export interface Resources {
    credits: number;
    metal: number;
    crystal: number;
    energy: number;
    minerals?: number; // Deprecated, keeping for safety until refactor
}

export interface Station {
    id: string;
    name: string;
    ownerId: string;
    level: number;
    position: Position;
    buildings: Building[];
    defenses: Defense[];
}

export interface Position {
    x: number;
    y: number;
    sector: string;
}

export interface Building {
    id: string;
    type: BuildingType;
    level: number;
    isUpgrading: boolean;
    upgradeCompletesAt?: Date;
}

export const BuildingType = {
    COMMAND_CENTER: 'command_center',
    RESOURCE_EXTRACTOR: 'resource_extractor',
    ENERGY_PLANT: 'energy_plant',
    RESEARCH_LAB: 'research_lab',
    SHIPYARD: 'shipyard',
    DEFENSE_GRID: 'defense_grid',
} as const;

export type BuildingType = typeof BuildingType[keyof typeof BuildingType];

export interface Defense {
    id: string;
    type: DefenseType;
    level: number;
    quantity: number;
}

export const DefenseType = {
    LASER_TURRET: 'laser_turret',
    MISSILE_BATTERY: 'missile_battery',
    SHIELD_GENERATOR: 'shield_generator',
    PLASMA_CANNON: 'plasma_cannon',
} as const;

export type DefenseType = typeof DefenseType[keyof typeof DefenseType];

export interface Ship {
    id: string;
    type: ShipType;
    quantity: number;
    attack: number;
    defense: number;
    speed: number;
    cargo: number;
}

export const ShipType = {
    SCOUT: 'scout',
    FIGHTER: 'fighter',
    CRUISER: 'cruiser',
    BATTLESHIP: 'battleship',
    CARGO: 'cargo',
} as const;

export type ShipType = typeof ShipType[keyof typeof ShipType];

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface HealthCheckResponse {
    status: string;
    database: string;
    uptime: number;
    timestamp: string;
}

export interface Sector {
    id: string;
    name: string;
    x: number;
    y: number;
    type: string;
    difficulty: number;
    connections: string[];
    resources?: {
        metal: number;
        crystal: number;
        energy: number;
    };
    ownerAllianceId?: string;
    currentDefense?: number;
    maxDefense?: number;
    structures?: string[];
}

export interface MarketListing {
    _id: string;
    seller: {
        _id: string;
        username: string;
        email?: string;
    };
    type: 'RESOURCE' | 'ARTIFACT';
    content: any;
    price: number;
    createdAt: string;
}

export interface Alliance {
    _id: string;
    name: string;
    tag: string;
    leader?: {
        _id: string;
        username: string;
        email: string;
    };
    memberCount: number;
    level: number;
    resources: {
        credits: number;
        metal: number;
        crystal: number;
        energy: number;
    };
    createdAt: string;
}
