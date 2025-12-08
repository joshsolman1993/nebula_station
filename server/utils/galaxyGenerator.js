const SECTOR_TYPES = {
    SAFE_HAVEN: { id: 'SAFE_HAVEN', name: 'Safe Haven', color: '#4ade80', danger: 0 },
    NEBULA: { id: 'NEBULA', name: 'Nebula', color: '#60a5fa', danger: 3, bonus: 'crystal' },
    ASTEROID_FIELD: { id: 'ASTEROID_FIELD', name: 'Asteroid Field', color: '#94a3b8', danger: 4, bonus: 'metal' },
    VOID: { id: 'VOID', name: 'The Void', color: '#f87171', danger: 8, bonus: 'artifact' },
    HIGH_ORBIT: { id: 'HIGH_ORBIT', name: 'High Orbit', color: '#facc15', danger: 2, bonus: 'energy' }
};

// Deterministic generation or hardcoded map
// Let's create a small map of ~20 sectors for now to keep it manageable but interesting.
// Layout: Central Safe Haven, surrounded by rings of increasing danger.

const generateGalaxy = () => {
    const sectors = [];
    const connections = new Map(); // id -> set of neighbor ids

    const addSector = (id, name, x, y, type, difficulty) => {
        sectors.push({
            id,
            name,
            x,
            y,
            type,
            difficulty,
            connections: []
        });
    };

    const connect = (id1, id2) => {
        const s1 = sectors.find(s => s.id === id1);
        const s2 = sectors.find(s => s.id === id2);
        if (s1 && s2) {
            if (!s1.connections.includes(id2)) s1.connections.push(id2);
            if (!s2.connections.includes(id1)) s2.connections.push(id1);
        }
    };

    // Central Hub
    addSector('sec_alpha', 'Alpha Station', 0, 0, SECTOR_TYPES.SAFE_HAVEN.id, 1);

    // Inner Ring (Low Danger)
    addSector('sec_beta', 'Beta Mining Corp', 2, 0, SECTOR_TYPES.ASTEROID_FIELD.id, 2);
    addSector('sec_gamma', 'Gamma Research', -2, 0, SECTOR_TYPES.HIGH_ORBIT.id, 2);
    addSector('sec_delta', 'Delta Outpost', 0, 2, SECTOR_TYPES.NEBULA.id, 2);
    addSector('sec_epsilon', 'Epsilon Trade', 0, -2, SECTOR_TYPES.SAFE_HAVEN.id, 1);

    connect('sec_alpha', 'sec_beta');
    connect('sec_alpha', 'sec_gamma');
    connect('sec_alpha', 'sec_delta');
    connect('sec_alpha', 'sec_epsilon');

    // Connect Inner Ring
    connect('sec_beta', 'sec_delta');
    connect('sec_delta', 'sec_gamma');
    connect('sec_gamma', 'sec_epsilon');
    connect('sec_epsilon', 'sec_beta');

    // Outer Ring (Medium/High Danger)
    addSector('sec_zeta', 'Zeta Ruins', 4, 2, SECTOR_TYPES.VOID.id, 6);
    addSector('sec_eta', 'Eta Clouds', -4, 2, SECTOR_TYPES.NEBULA.id, 4);
    addSector('sec_theta', 'Theta Belt', 4, -2, SECTOR_TYPES.ASTEROID_FIELD.id, 4);
    addSector('sec_iota', 'Iota Deep', -4, -2, SECTOR_TYPES.VOID.id, 7);

    connect('sec_beta', 'sec_zeta');
    connect('sec_beta', 'sec_theta');
    connect('sec_gamma', 'sec_eta');
    connect('sec_gamma', 'sec_iota');
    connect('sec_delta', 'sec_zeta');
    connect('sec_delta', 'sec_eta');
    connect('sec_epsilon', 'sec_theta');
    connect('sec_epsilon', 'sec_iota');

    // Far Reaches (Extreme)
    addSector('sec_omega', 'Omega Point', 0, 6, SECTOR_TYPES.VOID.id, 10);
    connect('sec_zeta', 'sec_omega');
    connect('sec_eta', 'sec_omega');

    return sectors;
};

const GALAXY_MAP = generateGalaxy();

const getSectorById = (id) => GALAXY_MAP.find(s => s.id === id);

module.exports = {
    GALAXY_MAP,
    SECTOR_TYPES,
    getSectorById
};
