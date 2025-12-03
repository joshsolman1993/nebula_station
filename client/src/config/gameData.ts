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
];

export const getBuildingById = (id: string): Building | undefined => {
    return BUILDINGS.find((building) => building.id === id);
};
