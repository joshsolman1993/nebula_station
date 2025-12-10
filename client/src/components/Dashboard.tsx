import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GridSystem from './GridSystem';
import BuildingMenu from './BuildingMenu';
import EnergyStatus from './EnergyStatus';
import { BUILDINGS, getBuildingById } from '../config/gameData';
import gameService from '../services/gameService';
import TutorialAdvisor from './TutorialAdvisor';
import { Hammer, Gem, Zap, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSound } from '../contexts/SoundContext';
import EventBanner from './dashboard/EventBanner';

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
    const { user, updateUser } = useAuth();
    const { playSfx } = useSound();
    const [stationLayout, setStationLayout] = useState<StationBuilding[]>([]);
    const [stationSize, setStationSize] = useState(8);
    const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
    const [isBuilding, setIsBuilding] = useState(false);
    const [completedResearch, setCompletedResearch] = useState<string[]>([]);

    // Production data from server
    const [serverProduction, setServerProduction] = useState<ProductionRates>({ metal: 0, crystal: 0, energy: 0 });
    const [serverConsumption, setServerConsumption] = useState({ energy: 0 });
    const [netEnergy, setNetEnergy] = useState(0);
    const [efficiency, setEfficiency] = useState(100);
    const [globalEvents, setGlobalEvents] = useState({ quest: null, invasionActive: false, invasionSectorCount: 0 });

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

            setDisplayResources((prev) => ({
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
                setCompletedResearch(response.user.completedResearch || []);

                // Update global user context (important for quests)
                updateUser(response.user);

                lastUpdateRef.current = Date.now();
            }

            // Fetch Global Events
            const eventsResponse = await gameService.getGlobalEvents();
            if (eventsResponse.success) {
                setGlobalEvents(eventsResponse.events);
            }

        } catch (err: any) {
            console.error('Failed to load station:', err);
            toast.error('Failed to load station data');
        }
    };

    const handleBuild = async (buildingId: string, location?: { x: number; y: number }) => {
        const targetX = location?.x ?? selectedCell?.x;
        const targetY = location?.y ?? selectedCell?.y;

        if (targetX === undefined || targetY === undefined) return;

        setIsBuilding(true);

        try {
            const response = await gameService.buildBuilding(buildingId, targetX, targetY);

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
                setCompletedResearch(response.user.completedResearch || []);
                lastUpdateRef.current = Date.now();

                // Clear selection
                setSelectedCell(null);

                const buildingData = getBuildingById(buildingId);
                playSfx('build');
                toast.success(`Construction started: ${buildingData?.name}`, {
                    icon: '🏗️',
                });
            }
        } catch (err: any) {
            console.error('Build error:', err);
            toast.error(err.message || 'Failed to build. Please try again.');
        } finally {
            setIsBuilding(false);
        }
    };

    const handleCellClick = (x: number, y: number) => {
        const isOccupied = stationLayout.some((building) => building.x === x && building.y === y);

        if (isOccupied) {
            toast.error('This position is already occupied');
            return;
        }

        if (selectedBuildingId) {
            // Instant build mode
            handleBuild(selectedBuildingId, { x, y });
        } else {
            // Select cell mode
            setSelectedCell({ x, y });
        }
    };

    if (!user) return null;

    return (
        <div className="py-8">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4">
                {/* Header Compact */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="font-orbitron text-2xl font-bold text-white">Station Overview</h2>
                        <p className="font-rajdhani text-gray-400 text-sm">Manage your layout and buildings</p>
                    </div>
                </div>

                <EventBanner events={globalEvents} />

                {/* Resources Bar with Production Rates - Sticky */}
                <div className="sticky top-20 z-40 mb-6 bg-deepspace-950/80 backdrop-blur-xl border border-neon-cyan/20 rounded-xl p-4 shadow-[0_4px_30px_rgba(0,0,0,0.3)] box-glow">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <Hammer className="w-6 h-6 text-neon-cyan" />
                            <div>
                                <div className="font-rajdhani text-xs text-gray-400">Metal</div>
                                <div className="font-orbitron text-lg font-bold text-neon-cyan">
                                    {displayResources.metal.toLocaleString()}
                                </div>
                                {serverProduction.metal > 0 && (
                                    <div
                                        className={`font-rajdhani text-sm font-semibold flex items-center gap-1 ${efficiency < 100 ? 'text-red-400' : 'text-green-400'
                                            }`}
                                    >
                                        <span className="text-xs">▲</span> {serverProduction.metal.toFixed(1)}/h
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Gem className="w-6 h-6 text-neon-magenta" />
                            <div>
                                <div className="font-rajdhani text-xs text-gray-400">Crystal</div>
                                <div className="font-orbitron text-lg font-bold text-neon-magenta">
                                    {displayResources.crystal.toLocaleString()}
                                </div>
                                {serverProduction.crystal > 0 && (
                                    <div
                                        className={`font-rajdhani text-sm font-semibold flex items-center gap-1 ${efficiency < 100 ? 'text-red-400' : 'text-green-400'
                                            }`}
                                    >
                                        <span className="text-xs">▲</span> {serverProduction.crystal.toFixed(1)}/h
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-neon-amber" />
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
                            <Coins className="w-6 h-6 text-green-400" />
                            <div>
                                <div className="font-rajdhani text-xs text-gray-400">Credits</div>
                                <div className="font-orbitron text-lg font-bold text-green-400">
                                    {displayCredits.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
                            onBuild={(id) => handleBuild(id)}
                            selectedCell={selectedCell}
                            isBuilding={isBuilding}
                            completedResearch={completedResearch}
                            selectedBuildingId={selectedBuildingId}
                            onSelectBuilding={setSelectedBuildingId}
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-6 bg-deepspace-950/40 backdrop-blur-md border border-neon-cyan/20 rounded-xl p-6">
                    <h3 className="font-orbitron text-xl font-bold text-neon-cyan mb-3">📊 Station Info</h3>
                    <div className="grid md:grid-cols-3 gap-4 font-rajdhani text-sm">
                        <div>
                            <span className="text-gray-400">Grid Size:</span>
                            <span className="ml-2 text-white font-semibold">
                                {stationSize}x{stationSize}
                            </span>
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
            <TutorialAdvisor />
        </div>
    );
};

export default Dashboard;
