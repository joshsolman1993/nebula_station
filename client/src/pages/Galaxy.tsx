import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';
import { Rocket, Map as MapIcon, Navigation, Shield, AlertTriangle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

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

    // Fetch Map
    useEffect(() => {
        const fetchMap = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/galaxy/map', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    // Handle both old dictionary format and new dictionary format
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
    }, []);

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
                alert(data.error);
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

    // Coordinate conversion for SVG
    // Map coordinates are roughly -6 to 6. Canvas is 800x600.
    // Center is 400, 300. Scale factor 50.
    const toCanvas = (x: number, y: number) => ({
        cx: 400 + x * 60,
        cy: 300 - y * 60 // Invert Y for canvas
    });

    if (loading) return <div className="text-white text-center mt-20">Loading Star Charts...</div>;

    const currentSector = mapData.find(s => s.id === user?.currentSector);
    const isTraveling = !!user?.travelStatus?.destination;
    const destinationId = user?.travelStatus?.destination;

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
                {/* Star Background (CSS generated or static image could go here) */}

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
                        const isDestination = sector.id === destinationId;
                        const isNeighbor = currentSector?.connections.includes(sector.id);

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
                    <div className="absolute bottom-6 right-6 w-80 bg-gray-900/90 border border-gray-700 p-6 rounded-xl backdrop-blur-md shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedSector.name}</h3>
                                <div className="text-sm text-gray-400">{selectedSector.type.replace('_', ' ')}</div>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                <span className="text-xs font-bold text-red-400">Diff: {selectedSector.difficulty}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm text-gray-300">
                                {selectedSector.type === 'SAFE_HAVEN' && "A secure zone protected by Federation patrols."}
                                {selectedSector.type === 'NEBULA' && "Rich in Crystal deposits. Dangerous energy storms."}
                                {selectedSector.type === 'ASTEROID_FIELD' && "Dense metal asteroids. Pirate activity detected."}
                                {selectedSector.type === 'VOID' && "Uncharted space. High risk, high reward."}
                            </div>

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

                            {/* Claim Button */}
                            {!selectedSector.ownerAlliance && user?.allianceRole && ['Leader', 'Officer'].includes(user.allianceRole) && selectedSector.id === user?.currentSector && (
                                <div className="mt-4 pt-4 border-t border-gray-800">
                                    <button
                                        onClick={handleClaim}
                                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded flex items-center justify-center gap-2"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Claim Sector
                                    </button>
                                    <div className="text-xs text-center text-gray-500 mt-1">
                                        Cost: 10k Metal, 5k Credits
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Galaxy;
