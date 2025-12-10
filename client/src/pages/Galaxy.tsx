import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';
import { Rocket, Map as MapIcon, Navigation, Shield, AlertTriangle, Star, Hammer, Zap, Package } from 'lucide-react';
import toast from 'react-hot-toast';

import CombatArena from '../components/CombatArena';
import { SHIPS, SECTOR_STRUCTURES } from '../config/gameData';

interface Sector {
    id: string;
    name: string;
    x: number;
    y: number;
    type: string;
    difficulty: number;
    connections: string[];
    ownerAlliance?: {
        _id: string;
        name: string;
        tag: string;
        color: string;
    };
    currentDefense: number;
    maxDefense: number;
    defenseLevel: number;
    structures?: string[];
}

const SECTOR_COLORS: Record<string, string> = {
    SAFE_HAVEN: '#4ade80', // Green
    NEBULA: '#60a5fa', // Blue
    ASTEROID_FIELD: '#94a3b8', // Gray
    VOID: '#f87171', // Red
    HIGH_ORBIT: '#facc15' // Yellow
};

const Galaxy: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { playSfx } = useSound();
    const [mapData, setMapData] = useState<Sector[]>([]);
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
    const [loading, setLoading] = useState(true);
    const [traveling, setTraveling] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const [isSiegeModalOpen, setIsSiegeModalOpen] = useState(false);
    const [isReinforceModalOpen, setIsReinforceModalOpen] = useState(false);
    const [fleetComposition, setFleetComposition] = useState<Record<string, number>>({});
    const [battleReport, setBattleReport] = useState<any | null>(null);
    const [showCombat, setShowCombat] = useState(false);
    const [reinforceAmount, setReinforceAmount] = useState(100);
    const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);

    // Initial load map
    useEffect(() => {
        const fetchMap = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/galaxy/map', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    const sectors = data.map.sectors ? Object.values(data.map.sectors) : Object.values(data.map);
                    setMapData(sectors as Sector[]);
                }
            } catch (err) {
                console.error('Failed to fetch map', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMap();
    }, [battleReport, isBuildModalOpen]); // Refresh map after battle or build

    // ... existing handlers ...
    // Note: I'm skipping the repetitive handlers to save space in this tool call, 
    // assuming they are preserved if I don't touch them. 
    // Wait, replace_file_content requires contiguous block. 
    // The previous edit messed up the Header. I need to restore the Header section properly.

    const handleBuild = async (structureId: string) => {
        if (!selectedSector) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance/build-sector', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sectorId: selectedSector.id,
                    structureId
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                refreshUser();
                setIsBuildModalOpen(false);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Build error:', error);
            toast.error('Build failed');
        }
    };



    const handleSiege = async () => {
        if (!selectedSector) return;

        // Basic validation before API call
        const totalShips = Object.values(fleetComposition).reduce((sum, count) => sum + count, 0);
        if (totalShips === 0) {
            toast.error('Select ships to deploy!');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance/siege-sector', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    targetSectorId: selectedSector.id,
                    fleetComposition
                })
            });
            const data = await res.json();

            if (data.success) {
                setIsSiegeModalOpen(false); // Close selection modal
                setBattleReport(data.battleReport);
                setShowCombat(true); // Open combat visualizer
                refreshUser();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Siege error:', error);
            toast.error('Failed to launch siege');
        }
    };

    const handleReinforce = async () => {
        if (!selectedSector) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance/reinforce-sector', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sectorId: selectedSector.id,
                    amount: parseInt(reinforceAmount.toString())
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setIsReinforceModalOpen(false);
                refreshUser();
                // Update local sector data
                if (selectedSector.id === data.sector.id) return; // Wait for re-fetch
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleShipCountChange = (shipId: string, count: number) => {
        // Logic similar to Operations.tsx for availability
        const totalOwned = user?.ships?.[shipId] || 0;
        const damaged = user?.damagedShips?.[shipId] || 0;
        const missionLocked = (user?.activeMission?.shipId === shipId) ? (user?.activeMission?.shipCount || 0) : 0;
        const available = Math.max(0, totalOwned - damaged - missionLocked);

        const max = available;
        const newCount = Math.min(Math.max(0, count), max);

        setFleetComposition(prev => ({
            ...prev,
            [shipId]: newCount
        }));
    };

    // Travel Timer
    useEffect(() => {
        if (user?.travelStatus?.arrivalTime) {
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const arrival = new Date(user.travelStatus.arrivalTime).getTime();
                const diff = Math.ceil((arrival - now) / 1000);

                if (diff <= 0) {
                    setTimeLeft(0);
                    handleArrive();
                    clearInterval(interval);
                } else {
                    setTimeLeft(diff);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [user?.travelStatus]);

    const handleTravel = async () => {
        if (!selectedSector) return;
        setTraveling(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/galaxy/travel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetSectorId: selectedSector.id })
            });
            const data = await res.json();
            if (data.success) {
                playSfx('success');
                refreshUser();
            } else {
                playSfx('error');
                toast.error(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setTraveling(false);
        }
    };

    const handleArrive = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/galaxy/arrive', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                playSfx('levelup'); // Arrival sound
                refreshUser();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleClaim = async () => {
        if (!confirm(`Claim ${selectedSector?.name} for 10,000 Metal & 5,000 Credits?`)) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance/claim-sector', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ sectorId: selectedSector?.id })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Sector Claimed!');
                // Refresh map
                const mapRes = await fetch('http://localhost:5000/api/galaxy/map', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const mapData = await mapRes.json();
                if (mapData.success) {
                    const sectors = mapData.map.sectors ? Object.values(mapData.map.sectors) : Object.values(mapData.map);
                    setMapData(sectors as Sector[]);
                }
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Coordinate conversion
    const toCanvas = (x: number, y: number) => ({
        cx: 400 + x * 60,
        cy: 300 - y * 60
    });

    if (loading) return <div className="text-white text-center mt-20">Loading Star Charts...</div>;

    const currentSector = mapData.find(s => s.id === user?.currentSector);
    const isTraveling = !!user?.travelStatus?.destination;

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <MapIcon className="w-8 h-8 text-neon-cyan" />
                    Astral Chart
                </h1>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                        <span className="text-gray-400 text-sm">Current Sector:</span>
                        <div className="text-neon-cyan font-bold">{currentSector?.name || 'Unknown'}</div>
                    </div>
                    {isTraveling && (
                        <div className="bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-500 animate-pulse">
                            <span className="text-blue-300 text-sm">Traveling...</span>
                            <div className="text-white font-bold">{timeLeft}s</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-black/40 rounded-xl border border-gray-800 relative overflow-hidden backdrop-blur-sm">
                <svg className="w-full h-full" viewBox="0 0 800 600">
                    {/* Connections */}
                    {mapData.map(sector =>
                        sector.connections.map(targetId => {
                            const target = mapData.find(s => s.id === targetId);
                            if (!target) return null;
                            const start = toCanvas(sector.x, sector.y);
                            const end = toCanvas(target.x, target.y);
                            return (
                                <line
                                    key={`${sector.id}-${target.id}`}
                                    x1={start.cx} y1={start.cy}
                                    x2={end.cx} y2={end.cy}
                                    stroke="#334155"
                                    strokeWidth="2"
                                />
                            );
                        })
                    )}

                    {/* Sectors */}
                    {mapData.map(sector => {
                        const { cx, cy } = toCanvas(sector.x, sector.y);
                        const isCurrent = sector.id === user?.currentSector;
                        const isSelected = selectedSector?.id === sector.id;
                        const isDestination = sector.id === user?.travelStatus?.destination;

                        const hasWarpGate = sector.structures?.includes('warp_gate');

                        return (
                            <g
                                key={sector.id}
                                onClick={() => setSelectedSector(sector)}
                                className="cursor-pointer transition-all duration-300"
                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                            >
                                {/* Glow for current/selected */}
                                {(isCurrent || isSelected || isDestination) && (
                                    <circle
                                        cx={cx} cy={cy} r={25}
                                        fill="none"
                                        stroke={isCurrent ? '#4ade80' : isDestination ? '#60a5fa' : '#facc15'}
                                        strokeWidth="2"
                                        className="animate-ping opacity-20"
                                    />
                                )}

                                {/* Territory Border */}
                                {sector.ownerAlliance && (
                                    <circle
                                        cx={cx} cy={cy} r={18}
                                        fill="none"
                                        stroke={sector.ownerAlliance.color || '#3b82f6'}
                                        strokeWidth="2"
                                        strokeOpacity="0.8"
                                    />
                                )}

                                {/* Sector Node */}
                                <circle
                                    cx={cx} cy={cy} r={12}
                                    fill={SECTOR_COLORS[sector.type] || '#fff'}
                                    stroke={isSelected ? '#fff' : 'none'}
                                    strokeWidth="2"
                                    className="hover:r-14 transition-all"
                                />

                                {/* Warp Gate Indicator */}
                                {hasWarpGate && (
                                    <text x={cx + 8} y={cy - 8} fontSize="10" className="animate-pulse">🌀</text>
                                )}

                                {/* Label */}
                                <text
                                    x={cx} y={cy + 25}
                                    textAnchor="middle"
                                    fill={isSelected ? '#fff' : '#94a3b8'}
                                    fontSize="10"
                                    className="pointer-events-none font-rajdhani"
                                >
                                    {sector.name}
                                </text>

                                {/* Player Icon */}
                                {isCurrent && !isTraveling && (
                                    <text x={cx - 6} y={cy + 4} fontSize="12">🚀</text>
                                )}
                                {isDestination && (
                                    <text x={cx - 6} y={cy + 4} fontSize="12" className="animate-bounce">🛸</text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Info Panel */}
                {selectedSector && (
                    <div className="absolute bottom-6 right-6 w-80 bg-gray-900/90 border border-gray-700 p-6 rounded-xl backdrop-blur-md shadow-2xl overflow-y-auto max-h-[80vh]">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedSector.name}</h3>
                                <div className="text-sm text-gray-400">{selectedSector.type.replace('_', ' ')}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-red-400">Diff: {selectedSector.difficulty}</span>
                                <span className="text-xs font-mono text-cyan-400">Def: {selectedSector.currentDefense || 0}/{selectedSector.maxDefense || 1000}</span>
                            </div>
                        </div>

                        {/* Defense Bar */}
                        <div className="w-full h-1 bg-gray-800 rounded mb-4 overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${((selectedSector.currentDefense || 0) / (selectedSector.maxDefense || 1000)) * 100}%` }}
                            />
                        </div>

                        <div className="space-y-4">
                            {/* Ownership Info */}
                            <div className="bg-black/30 p-3 rounded border border-gray-700">
                                <div className="text-xs text-gray-500 uppercase">Controlled By</div>
                                {selectedSector.ownerAlliance ? (
                                    <div className="font-bold text-white flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: selectedSector.ownerAlliance.color || '#fff' }}
                                        ></span>
                                        [{selectedSector.ownerAlliance.tag}] {selectedSector.ownerAlliance.name}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 italic">Unclaimed Sector</div>
                                )}
                            </div>

                            {/* Infrastructure List */}
                            {selectedSector.structures && selectedSector.structures.length > 0 && (
                                <div className="bg-black/30 p-3 rounded border border-gray-700">
                                    <div className="text-xs text-gray-500 uppercase mb-2">Infrastructure</div>
                                    <div className="space-y-1">
                                        {selectedSector.structures.map((sId, idx) => {
                                            const struct = SECTOR_STRUCTURES.find(s => s.id === sId);
                                            return (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-cyan-300">
                                                    <span>{struct?.icon || '🏗️'}</span>
                                                    <span>{struct?.name || sId}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedSector.id !== user?.currentSector && (
                                <div className="pt-4 border-t border-gray-800">
                                    {currentSector?.connections.includes(selectedSector.id) ? (
                                        <button
                                            onClick={handleTravel}
                                            disabled={isTraveling || traveling}
                                            className={`
                                                w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2
                                                ${isTraveling
                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}
                                            `}
                                        >
                                            <Navigation className="w-4 h-4" />
                                            {isTraveling ? 'Fleet Busy' : 'Initiate Jump (50 Energy)'}
                                        </button>
                                    ) : (
                                        <div className="text-center text-red-500 text-sm flex items-center justify-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Out of Range
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sector Actions (Siege/Reinforce) */}
                            {selectedSector.id === user?.currentSector && (
                                <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                                    {/* Claim logic */}
                                    {!selectedSector.ownerAlliance && user?.allianceRole && ['Leader', 'Officer'].includes(user.allianceRole) && (
                                        <button
                                            onClick={handleClaim}
                                            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded flex items-center justify-center gap-2"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Claim Sector
                                        </button>
                                    )}

                                    {/* Siege Logic */}
                                    {selectedSector.ownerAlliance && user?.alliance && String(selectedSector.ownerAlliance._id) !== String(user.alliance) && (
                                        <button
                                            onClick={() => setIsSiegeModalOpen(true)}
                                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
                                        >
                                            <Rocket className="w-4 h-4" />
                                            Siege Sector
                                        </button>
                                    )}

                                    {/* Alliance Controls */}
                                    {selectedSector.ownerAlliance && user?.alliance && String(selectedSector.ownerAlliance._id) === String(user.alliance) && (
                                        <>
                                            <button
                                                onClick={() => setIsReinforceModalOpen(true)}
                                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
                                            >
                                                <Shield className="w-4 h-4" />
                                                Reinforce Defense
                                            </button>
                                            <button
                                                onClick={() => setIsBuildModalOpen(true)}
                                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
                                            >
                                                <Hammer className="w-4 h-4" />
                                                Build Infrastructure
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Siege Modal (Fleet Selection) */}
                {isSiegeModalOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-red-500 p-6 rounded-xl max-w-2xl w-full">
                            <h2 className="text-2xl font-orbitron text-red-500 mb-4 flex items-center gap-2">
                                <Rocket /> Siege Preparation
                            </h2>
                            <p className="text-gray-400 mb-6">Select your fleet to assault {selectedSector?.name} defense platform.</p>

                            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                                {SHIPS.filter(ship => (user?.ships?.[ship.id] || 0) > 0).map(ship => {
                                    const totalOwned = user?.ships?.[ship.id] || 0;
                                    const damaged = user?.damagedShips?.[ship.id] || 0;
                                    const missionLocked = (user?.activeMission?.shipId === ship.id) ? (user?.activeMission?.shipCount || 0) : 0;
                                    const available = Math.max(0, totalOwned - damaged - missionLocked);

                                    return (
                                        <div key={ship.id} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{ship.icon}</span>
                                                <div>
                                                    <div className="font-bold text-white">{ship.name}</div>
                                                    <div className="text-xs text-gray-400">Avail: {available}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleShipCountChange(ship.id, (fleetComposition[ship.id] || 0) - 1)}
                                                    className="w-8 h-8 bg-black rounded border border-gray-600 text-white"
                                                >-</button>
                                                <span className="w-8 text-center text-white">{fleetComposition[ship.id] || 0}</span>
                                                <button
                                                    onClick={() => handleShipCountChange(ship.id, (fleetComposition[ship.id] || 0) + 1)}
                                                    disabled={available === 0}
                                                    className="w-8 h-8 bg-black rounded border border-gray-600 text-white"
                                                >+</button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-end gap-4">
                                <button onClick={() => setIsSiegeModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button
                                    onClick={handleSiege}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded"
                                >
                                    Launch Assault
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reinforce Modal */}
                {isReinforceModalOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-green-500 p-6 rounded-xl max-w-md w-full">
                            <h2 className="text-2xl font-orbitron text-green-500 mb-4">Reinforce Sector</h2>
                            <p className="text-gray-400 mb-4">Repair sector defenses using Metal.</p>

                            <div className="mb-6">
                                <label className="block text-sm text-gray-500 mb-1">Metal Amount</label>
                                <input
                                    type="number"
                                    value={reinforceAmount}
                                    onChange={(e) => setReinforceAmount(Math.max(1, parseInt(e.target.value)))}
                                    className="w-full bg-black border border-gray-700 text-white px-4 py-2 rounded"
                                />
                                <div className="text-xs text-right text-gray-500 mt-1">
                                    Available: {user?.resources.metal} | Required: {(selectedSector?.maxDefense || 1000) - (selectedSector?.currentDefense || 0)}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button onClick={() => setIsReinforceModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button
                                    onClick={handleReinforce}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded"
                                >
                                    Reinforce
                                </button>
                            </div>
                        </div>
                    </div>
                )}



                {/* Build Modal */}
                {isBuildModalOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-indigo-500 p-6 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-orbitron text-indigo-500 mb-4 flex items-center gap-2">
                                <Hammer /> Infrastructure Construction
                            </h2>
                            <p className="text-gray-400 mb-6">Construct support facilities to enhance your sector's capabilities.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {SECTOR_STRUCTURES.map(structure => {
                                    const currentCount = (selectedSector?.structures?.filter(id => id === structure.id) || []).length;
                                    const isMaxed = currentCount >= (structure.maxCount || 1);

                                    return (
                                        <div key={structure.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg flex flex-col">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-3xl">{structure.icon}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${isMaxed ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                                                    {currentCount} / {structure.maxCount}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">{structure.name}</h3>
                                            <p className="text-gray-400 text-sm mb-4 flex-1">{structure.description}</p>

                                            <div className="space-y-1 mb-4 text-sm font-mono">
                                                {structure.cost.metal && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Metal</span>
                                                        <span className="text-cyan-400">{structure.cost.metal}</span>
                                                    </div>
                                                )}
                                                {structure.cost.crystal && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Crystal</span>
                                                        <span className="text-purple-400">{structure.cost.crystal}</span>
                                                    </div>
                                                )}
                                                {structure.cost.credits && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Credits</span>
                                                        <span className="text-yellow-400">{structure.cost.credits}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleBuild(structure.id)}
                                                disabled={isMaxed}
                                                className={`w-full py-2 rounded font-bold ${isMaxed
                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                                    }`}
                                            >
                                                {isMaxed ? 'Max Limit' : 'Construct'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end mt-6">
                                <button onClick={() => setIsBuildModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Close</button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Combat Arena Overlay */}
                {showCombat && battleReport && selectedSector && (
                    <CombatArena
                        battleResult={battleReport}
                        enemyName={`${selectedSector.name} Defense`}
                        enemyTotalHP={selectedSector.maxDefense || 1000}
                        playerTotalHP={Object.entries(fleetComposition).reduce((total, [shipId, count]) => {
                            const ship = SHIPS.find(s => s.id === shipId);
                            return total + ((ship?.defense || 10) * count);
                        }, 0)}
                        onClose={() => {
                            setShowCombat(false);
                            setBattleReport(null);
                        }}
                    />
                )}

            </div>
        </div>
    );
};

export default Galaxy;
