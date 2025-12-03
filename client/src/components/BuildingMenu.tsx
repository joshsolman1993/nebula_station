import { useState } from 'react';

interface Building {
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

interface BuildingMenuProps {
    buildings: Building[];
    userResources: {
        metal: number;
        crystal: number;
        energy: number;
    };
    userCredits: number;
    onBuild: (buildingId: string) => void;
    selectedCell: { x: number; y: number } | null;
    isBuilding: boolean;
}

const BuildingMenu = ({
    buildings,
    userResources,
    userCredits,
    onBuild,
    selectedCell,
    isBuilding,
}: BuildingMenuProps) => {
    const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

    const canAfford = (building: Building) => {
        return (
            userResources.metal >= building.cost.metal &&
            userResources.crystal >= building.cost.crystal &&
            userResources.energy >= building.cost.energy &&
            userCredits >= building.cost.credits
        );
    };

    const formatProduction = (production: Building['production']) => {
        const items = [];
        if (production.metal > 0) items.push(`+${production.metal} Metal/h`);
        if (production.crystal > 0) items.push(`+${production.crystal} Crystal/h`);
        if (production.energy > 0) items.push(`+${production.energy} Energy/h`);
        if (production.credits > 0) items.push(`+${production.credits} Credits/h`);
        return items.join(', ');
    };

    const formatCost = (cost: Building['cost']) => {
        const items = [];
        if (cost.metal > 0) items.push(`${cost.metal} 🔩`);
        if (cost.crystal > 0) items.push(`${cost.crystal} 💎`);
        if (cost.energy > 0) items.push(`${cost.energy} ⚡`);
        if (cost.credits > 0) items.push(`${cost.credits} 💰`);
        return items.join(' · ');
    };

    const handleBuild = () => {
        if (selectedBuilding && selectedCell) {
            onBuild(selectedBuilding);
        }
    };

    return (
        <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-magenta/30 rounded-xl p-6">
            <h3 className="font-orbitron text-2xl font-bold text-neon-magenta mb-4 flex items-center gap-3">
                <span>🏭</span>
                Building Menu
            </h3>

            {/* Building List */}
            <div className="space-y-3 mb-6">
                {buildings.map((building) => {
                    const affordable = canAfford(building);
                    const selected = selectedBuilding === building.id;

                    return (
                        <button
                            key={building.id}
                            onClick={() => setSelectedBuilding(building.id)}
                            className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                ${selected
                                    ? 'border-neon-amber bg-neon-amber/10'
                                    : affordable
                                        ? 'border-neon-cyan/30 bg-deepspace-900/30 hover:border-neon-cyan/60'
                                        : 'border-gray-700/30 bg-deepspace-900/20 opacity-60'
                                }
              `}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span
                                        className="font-orbitron text-lg font-bold"
                                        style={{ color: building.color }}
                                    >
                                        {building.icon}
                                    </span>
                                    <div>
                                        <h4 className="font-orbitron font-bold text-white">
                                            {building.name}
                                        </h4>
                                        <p className="text-xs text-gray-400 font-rajdhani">
                                            {building.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs font-rajdhani">
                                <div>
                                    <span className="text-gray-500">Cost: </span>
                                    <span className={affordable ? 'text-neon-cyan' : 'text-red-400'}>
                                        {formatCost(building.cost)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 text-xs font-rajdhani">
                                <span className="text-gray-500">Produces: </span>
                                <span className="text-green-400">{formatProduction(building.production)}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Build Button */}
            <div className="border-t border-gray-700/30 pt-4">
                {!selectedCell ? (
                    <div className="text-center p-4 bg-deepspace-900/30 rounded-lg border border-gray-700/30">
                        <p className="text-sm text-gray-400 font-rajdhani">
                            Select an empty cell on the grid to build
                        </p>
                    </div>
                ) : !selectedBuilding ? (
                    <div className="text-center p-4 bg-deepspace-900/30 rounded-lg border border-gray-700/30">
                        <p className="text-sm text-gray-400 font-rajdhani">
                            Select a building to construct
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={handleBuild}
                        disabled={
                            !selectedBuilding ||
                            !selectedCell ||
                            !canAfford(buildings.find((b) => b.id === selectedBuilding)!) ||
                            isBuilding
                        }
                        className="w-full px-6 py-3 bg-neon-cyan/20 border-2 border-neon-cyan rounded-lg font-orbitron font-bold text-neon-cyan hover:bg-neon-cyan/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isBuilding ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Building...
                            </span>
                        ) : (
                            `Build at (${selectedCell.x}, ${selectedCell.y})`
                        )}
                    </button>
                )}
            </div>

            {/* Insufficient Resources Warning */}
            {selectedBuilding && selectedCell && !canAfford(buildings.find((b) => b.id === selectedBuilding)!) && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-400 font-rajdhani font-semibold">
                        ⚠️ Insufficient Resources
                    </p>
                </div>
            )}
        </div>
    );
};

export default BuildingMenu;
