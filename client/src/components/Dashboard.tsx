import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GridSystem from './GridSystem';
import BuildingMenu from './BuildingMenu';
import EnergyStatus from './EnergyStatus';
import { BUILDINGS } from '../config/gameData';
import gameService from '../services/gameService';

interface StationBuilding {
    x: number;
    y: number;
    buildingId: string;
    level: number;
    builtAt?: Date;
}

interface ProductionRates {
    metal: number;
    crystal: number;
    energy: number;
}

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [stationLayout, setStationLayout] = useState<StationBuilding[]>([]);
    const [stationSize, setStationSize] = useState(8);
    const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
    const [isBuilding, setIsBuilding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Production data from server
    const [serverProduction, setServerProduction] = useState<ProductionRates>({ metal: 0, crystal: 0, energy: 0 });
    const [serverConsumption, setServerConsumption] = useState({ energy: 0 });
    const [netEnergy, setNetEnergy] = useState(0);
    const [efficiency, setEfficiency] = useState(100);

    // Client-side estimated resources (for live counter effect)
    const [displayResources, setDisplayResources] = useState({
        metal: user?.resources.metal || 0,
        crystal: user?.resources.crystal || 0,
        energy: user?.resources.energy || 0,
    });
    const [displayCredits, setDisplayCredits] = useState(user?.credits || 0);

    const lastUpdateRef = useRef<number>(Date.now());

    // Load station data on mount
    useEffect(() => {
        loadStation();
    }, []);

    // Client-side resource ticker (runs every second)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedSeconds = (now - lastUpdateRef.current) / 1000;

            // Calculate resources gained per second
            const metalPerSec = serverProduction.metal / 3600;
            const crystalPerSec = serverProduction.crystal / 3600;
            const energyPerSec = serverProduction.energy / 3600;

            setDisplayResources(prev => ({
                metal: Math.floor(prev.metal + metalPerSec * elapsedSeconds),
                crystal: Math.floor(prev.crystal + crystalPerSec * elapsedSeconds),
                energy: Math.floor(prev.energy + energyPerSec * elapsedSeconds),
            }));

            lastUpdateRef.current = now;
        }, 1000);

        return () => clearInterval(interval);
    }, [serverProduction]);

    const loadStation = async () => {
        try {
            const response = await gameService.getStation();
            if (response.success) {
                setStationLayout(response.station.layout);
                setStationSize(response.station.size);

                // Update production rates
                setServerProduction(response.production);
                setServerConsumption(response.consumption);
                setNetEnergy(response.netEnergy);
                setEfficiency(response.efficiency);

                // Sync display resources with server data
                setDisplayResources(response.user.resources);
                setDisplayCredits(response.user.credits);
                lastUpdateRef.current = Date.now();
            }
        } catch (err: any) {
            console.error('Failed to load station:', err);
            setError('Failed to load station data');
        }
    };

    const handleCellClick = (x: number, y: number) => {
        const isOccupied = stationLayout.some((building) => building.x === x && building.y === y);

        if (isOccupied) {
            setError('This position is already occupied');
            setTimeout(() => setError(null), 3000);
            return;
        }

        setSelectedCell({ x, y });
        setError(null);
    };

    const handleBuild = async (buildingId: string) => {
        if (!selectedCell) return;

        setIsBuilding(true);
        setError(null);

        try {
            const response = await gameService.buildBuilding(buildingId, selectedCell.x, selectedCell.y);

            if (response.success) {
                // Update station layout
                setStationLayout(response.station.layout);

                // Update production rates
                setServerProduction(response.production);
                setServerConsumption(response.consumption);
                setNetEnergy(response.netEnergy);
                setEfficiency(response.efficiency);

                // Sync display resources with server data
                setDisplayResources(response.user.resources);
                setDisplayCredits(response.user.credits);
                lastUpdateRef.current = Date.now();

                // Clear selection
                setSelectedCell(null);

                console.log('✅ Building placed successfully!');
            }
        } catch (err: any) {
            console.error('Build error:', err);
            setError(err.message || 'Failed to build. Please try again.');
        } finally {
            setIsBuilding(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-space-gradient">
            {/* Header */}
            <header className="border-b border-neon-cyan/20 bg-deepspace-950/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="font-orbitron text-2xl font-bold text-neon-cyan">
                            NEBULA STATION
                        </h1>
                        <p className="font-rajdhani text-sm text-gray-400">
                            Command Center - {user.username}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg font-rajdhani font-semibold text-red-400 hover:bg-red-500/30 transition-all duration-200"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Resources Bar with Production Rates */}
                <div className="mb-6 bg-deepspace-950/40 backdrop-blur-md border border-neon-cyan/20 rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🔩</span>
                            <div>
                                <div className="font-rajdhani text-xs text-gray-400">Metal</div>
                                <div className="font-orbitron text-lg font-bold text-neon-cyan">
                                    {displayResources.metal.toLocaleString()}
                                </div>
                                {serverProduction.metal > 0 && (
                                    <div className={`font-rajdhani text-xs ${efficiency < 100 ? 'text-red-400' : 'text-green-400'}`}>
                                        +{serverProduction.metal.toFixed(1)}/h
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💎</span>
                            <div>
                                <div className="font-rajdhani text-xs text-gray-400">Crystal</div>
                                <div className="font-orbitron text-lg font-bold text-neon-magenta">
                                    {displayResources.crystal.toLocaleString()}
                                </div>
                                {serverProduction.crystal > 0 && (
                                    <div className={`font-rajdhani text-xs ${efficiency < 100 ? 'text-red-400' : 'text-green-400'}`}>
                                        +{serverProduction.crystal.toFixed(1)}/h
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚡</span>
                            <div>
                                <div className="font-rajdhani text-xs text-gray-400">Energy</div>
                                <div className="font-orbitron text-lg font-bold text-neon-amber">
                                    {displayResources.energy.toLocaleString()}
                                </div>
                                {serverProduction.energy > 0 && (
                                    <div className="font-rajdhani text-xs text-green-400">
                                        +{serverProduction.energy.toFixed(1)}/h
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">💰</span>
                            <div>
                                <div className="font-rajdhani text-xs text-gray-400">Credits</div>
                                <div className="font-orbitron text-lg font-bold text-green-400">
                                    {displayCredits.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <p className="font-rajdhani text-red-400 font-semibold">⚠️ {error}</p>
                    </div>
                )}

                {/* Energy Status */}
                <div className="mb-6">
                    <EnergyStatus
                        production={serverProduction.energy}
                        consumption={serverConsumption.energy}
                        netEnergy={netEnergy}
                        efficiency={efficiency}
                    />
                </div>

                {/* Grid and Building Menu */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Grid System - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <GridSystem
                            size={stationSize}
                            layout={stationLayout}
                            onCellClick={handleCellClick}
                            selectedCell={selectedCell}
                        />
                    </div>

                    {/* Building Menu - Takes 1 column */}
                    <div>
                        <BuildingMenu
                            buildings={BUILDINGS}
                            userResources={displayResources}
                            userCredits={displayCredits}
                            onBuild={handleBuild}
                            selectedCell={selectedCell}
                            isBuilding={isBuilding}
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-6 bg-deepspace-950/40 backdrop-blur-md border border-neon-cyan/20 rounded-xl p-6">
                    <h3 className="font-orbitron text-xl font-bold text-neon-cyan mb-3">
                        📊 Station Info
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 font-rajdhani text-sm">
                        <div>
                            <span className="text-gray-400">Grid Size:</span>
                            <span className="ml-2 text-white font-semibold">{stationSize}x{stationSize}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Buildings:</span>
                            <span className="ml-2 text-white font-semibold">{stationLayout.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Available Slots:</span>
                            <span className="ml-2 text-white font-semibold">
                                {stationSize * stationSize - stationLayout.length}
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Decorative corners */}
            <div className="fixed top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-neon-cyan/10 pointer-events-none"></div>
            <div className="fixed top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-neon-magenta/10 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-neon-amber/10 pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-neon-cyan/10 pointer-events-none"></div>
        </div>
    );
};

export default Dashboard;
