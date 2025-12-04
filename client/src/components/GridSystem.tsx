import { useState, useEffect } from 'react';
import { Sun, Hammer, Gem, Plus } from 'lucide-react';

interface Building {
    x: number;
    y: number;
    buildingId: string;
    level: number;
    builtAt?: Date;
}

interface GridSystemProps {
    size: number;
    layout: Building[];
    onCellClick: (x: number, y: number) => void;
    selectedCell: { x: number; y: number } | null;
}

const GridSystem = ({ size, layout, onCellClick, selectedCell }: GridSystemProps) => {
    const [grid, setGrid] = useState<(Building | null)[][]>([]);

    useEffect(() => {
        // Initialize empty grid
        const newGrid: (Building | null)[][] = Array(size)
            .fill(null)
            .map(() => Array(size).fill(null));

        // Place buildings on grid
        layout.forEach((building) => {
            if (building.x < size && building.y < size) {
                newGrid[building.y][building.x] = building;
            }
        });

        setGrid(newGrid);
    }, [size, layout]);

    const getBuildingIcon = (buildingId: string) => {
        switch (buildingId) {
            case 'solar_core':
                return <Sun className="w-6 h-6" />;
            case 'metal_extractor':
                return <Hammer className="w-6 h-6" />;
            case 'crystal_synthesizer':
                return <Gem className="w-6 h-6" />;
            default:
                return <Plus className="w-6 h-6" />;
        }
    };

    const getBuildingColor = (buildingId: string) => {
        switch (buildingId) {
            case 'solar_core':
                return '#ffbf00';
            case 'metal_extractor':
                return '#00f0ff';
            case 'crystal_synthesizer':
                return '#ff00ff';
            default:
                return '#888';
        }
    };

    const isSelected = (x: number, y: number) => {
        return selectedCell?.x === x && selectedCell?.y === y;
    };

    return (
        <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-cyan/30 rounded-xl p-6 overflow-hidden">
            <h3 className="font-orbitron text-2xl font-bold text-neon-cyan mb-4 flex items-center gap-3">
                <span>🏗️</span>
                Station Grid
            </h3>

            <div className="overflow-x-auto pb-2">
                <div
                    className="grid gap-2 min-w-fit"
                    style={{
                        gridTemplateColumns: `repeat(${size}, minmax(48px, 1fr))`,
                    }}
                >
                    {grid.map((row, y) =>
                        row.map((cell, x) => {
                            const building = cell;
                            const selected = isSelected(x, y);
                            const color = building ? getBuildingColor(building.buildingId) : undefined;

                            return (
                                <button
                                    key={`${x}-${y}`}
                                    onClick={() => onCellClick(x, y)}
                                    className={`
                    aspect-square relative
                    bg-deepspace-900/50 
                    border-2 
                    ${selected
                                            ? 'border-neon-amber shadow-[0_0_15px_rgba(255,191,0,0.5)]'
                                            : building
                                                ? 'border-neon-cyan/50'
                                                : 'border-gray-700/30'
                                        }
                    rounded-lg
                    hover:border-neon-cyan/70
                    transition-all duration-200
                    ${!building && 'hover:bg-deepspace-800/50'}
                    flex items-center justify-center
                    group
                    ${building ? 'animate-scale-in' : ''}
                  `}
                                >
                                    {building ? (
                                        <div className="flex flex-col items-center justify-center w-full h-full">
                                            <span className="font-orbitron text-xs font-bold" style={{ color }}>
                                                {getBuildingIcon(building.buildingId)}
                                            </span>
                                            <span className="text-[8px] text-gray-500 mt-0.5">Lv.{building.level}</span>
                                        </div>
                                    ) : (
                                        <div className="text-gray-600 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    )}

                                    {/* Coordinates tooltip on hover */}
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-deepspace-950 border border-neon-cyan/50 rounded px-2 py-1 text-[10px] text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        ({x}, {y})
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400 font-rajdhani">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-700/30 rounded"></div>
                    <span>Empty</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-neon-cyan/50 rounded"></div>
                    <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-neon-amber rounded"></div>
                    <span>Selected</span>
                </div>
            </div>
        </div>
    );
};

export default GridSystem;
