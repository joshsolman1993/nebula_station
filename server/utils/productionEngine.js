const { getBuildingById, TECHNOLOGIES, getArtifactById } = require('../config/gameData');

/**
 * Calculate and apply resource production based on elapsed time
 * Uses "Lazy Update" pattern - only calculates when needed
 * 
 * @param {Object} user - User document from MongoDB
 * @param {Object} station - Station document from MongoDB
 * @returns {Object} Updated production stats and resources
 */
const calculateProduction = (user, station) => {
    const now = new Date();
    const lastUpdate = user.lastResourceUpdate || user.createdAt;
    const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);

    // If less than 1 second elapsed, no update needed
    if (elapsedSeconds < 1) {
        return {
            updated: false,
            elapsedSeconds: 0,
            production: { metal: 0, crystal: 0, energy: 0 },
            consumption: { energy: 0 },
            netEnergy: 0,
            efficiency: 100,
        };
    }

    // Initialize production and consumption counters
    let totalProduction = {
        metal: 0,
        crystal: 0,
        energy: 0,
    };

    let totalConsumption = {
        energy: 0,
    };

    // Calculate production from all buildings
    station.layout.forEach((building) => {
        const buildingData = getBuildingById(building.buildingId);
        if (!buildingData) return;

        // Add production (per hour -> per second)
        totalProduction.metal += buildingData.production.metal / 3600;
        totalProduction.crystal += buildingData.production.crystal / 3600;

        // Handle negative energy production (consumption defined in building data)
        if (buildingData.production.energy < 0) {
            totalConsumption.energy += Math.abs(buildingData.production.energy) / 3600;
        } else {
            totalProduction.energy += buildingData.production.energy / 3600;
        }

        // Add base energy consumption for production buildings if not already handled
        // (This logic might be redundant if buildings have negative energy production defined)
        // Keeping it for backward compatibility or specific game rules
        if ((buildingData.production.metal > 0 || buildingData.production.crystal > 0) && buildingData.production.energy >= 0) {
            // Each production building consumes 5 energy/h by default if not specified otherwise
            totalConsumption.energy += 5 / 3600;
        }
    });

    // Apply Research Bonuses
    if (user.completedResearch && user.completedResearch.includes(TECHNOLOGIES.ENERGY_GRID_OPTIMIZATION.id)) {
        const bonus = TECHNOLOGIES.ENERGY_GRID_OPTIMIZATION.effect.value;
        totalProduction.energy *= (1 + bonus);
    }
    // Apply Talent Bonuses
    if (user.talents) {
        // Efficient Mining: +5% Metal & Crystal per level
        if (user.talents.get('efficient_mining')) {
            const level = user.talents.get('efficient_mining');
            const bonus = level * 0.05;
            totalProduction.metal *= (1 + bonus);
            totalProduction.crystal *= (1 + bonus);
        }
        // Overclocking: +5% Energy per level
        if (user.talents.get('overclocking')) {
            const level = user.talents.get('overclocking');
            const bonus = level * 0.05;
            totalProduction.energy *= (1 + bonus);
        }
    }

    // Apply Artifact Bonuses
    if (user.equipment) {
        Object.values(user.equipment).forEach(itemId => {
            if (!itemId) return;
            const artifact = getArtifactById(itemId);
            if (artifact && artifact.effect.type === 'production_bonus') {
                const { resource, value } = artifact.effect;
                if (totalProduction[resource] !== undefined) {
                    totalProduction[resource] *= (1 + value);
                }
            }
        });
    }

    // Calculate net energy balance
    const netEnergy = totalProduction.energy - totalConsumption.energy;

    // Determine efficiency based on energy balance
    let efficiency = 100;
    if (netEnergy < 0) {
        // Energy deficit - production efficiency drops to 50%
        efficiency = 50;
        console.log(`⚠️  Energy deficit for ${user.username}: ${netEnergy.toFixed(2)}/s - Efficiency: ${efficiency}%`);
    }

    // Apply efficiency to production (energy production is not affected)
    const effectiveProduction = {
        metal: (totalProduction.metal * efficiency) / 100,
        crystal: (totalProduction.crystal * efficiency) / 100,
        energy: totalProduction.energy, // Energy production is always 100%
    };

    // Calculate total resources gained over elapsed time
    const resourcesGained = {
        metal: Math.floor(effectiveProduction.metal * elapsedSeconds),
        crystal: Math.floor(effectiveProduction.crystal * elapsedSeconds),
        energy: Math.floor(effectiveProduction.energy * elapsedSeconds),
    };

    // Update user resources
    user.resources.metal += resourcesGained.metal;
    user.resources.crystal += resourcesGained.crystal;
    user.resources.energy += resourcesGained.energy;

    // Update last resource update timestamp
    user.lastResourceUpdate = now;

    console.log(`✅ Production calculated for ${user.username}:`);
    console.log(`   Elapsed: ${elapsedSeconds}s`);
    console.log(`   Gained: Metal +${resourcesGained.metal}, Crystal +${resourcesGained.crystal}, Energy +${resourcesGained.energy}`);
    console.log(`   Efficiency: ${efficiency}%`);

    return {
        updated: true,
        elapsedSeconds,
        production: {
            metal: effectiveProduction.metal * 3600, // Convert back to per hour for display
            crystal: effectiveProduction.crystal * 3600,
            energy: totalProduction.energy * 3600,
        },
        consumption: {
            energy: totalConsumption.energy * 3600,
        },
        netEnergy: netEnergy * 3600, // Per hour
        efficiency,
        resourcesGained,
    };
};

/**
 * Get current production rates without updating resources
 * Used for display purposes
 */
const getProductionRates = (station, user) => {
    let totalProduction = {
        metal: 0,
        crystal: 0,
        energy: 0,
    };

    let totalConsumption = {
        energy: 0,
    };

    station.layout.forEach((building) => {
        const buildingData = getBuildingById(building.buildingId);
        if (!buildingData) return;

        totalProduction.metal += buildingData.production.metal;
        totalProduction.crystal += buildingData.production.crystal;

        if (buildingData.production.energy < 0) {
            totalConsumption.energy += Math.abs(buildingData.production.energy);
        } else {
            totalProduction.energy += buildingData.production.energy;
        }

        if ((buildingData.production.metal > 0 || buildingData.production.crystal > 0) && buildingData.production.energy >= 0) {
            totalConsumption.energy += 5; // 5 energy/h per production building
        }
    });

    // Apply Talent Bonuses
    if (user && user.talents) {
        // Efficient Mining: +5% Metal & Crystal per level
        if (user.talents.get('efficient_mining')) {
            const level = user.talents.get('efficient_mining');
            const bonus = level * 0.05;
            totalProduction.metal *= (1 + bonus);
            totalProduction.crystal *= (1 + bonus);
        }
        // Overclocking: +5% Energy per level
        if (user.talents.get('overclocking')) {
            const level = user.talents.get('overclocking');
            const bonus = level * 0.05;
            totalProduction.energy *= (1 + bonus);
        }
    }

    // Apply Artifact Bonuses
    if (user && user.equipment) {
        Object.values(user.equipment).forEach(itemId => {
            if (!itemId) return;
            const artifact = getArtifactById(itemId);
            if (artifact && artifact.effect.type === 'production_bonus') {
                const { resource, value } = artifact.effect;
                if (totalProduction[resource] !== undefined) {
                    totalProduction[resource] *= (1 + value);
                }
            }
        });
    }

    const netEnergy = totalProduction.energy - totalConsumption.energy;
    const efficiency = netEnergy < 0 ? 50 : 100;

    return {
        production: {
            metal: (totalProduction.metal * efficiency) / 100,
            crystal: (totalProduction.crystal * efficiency) / 100,
            energy: totalProduction.energy,
        },
        consumption: {
            energy: totalConsumption.energy,
        },
        netEnergy,
        efficiency,
    };
};

module.exports = {
    calculateProduction,
    getProductionRates,
};
