import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { Sector } from '../../types';
import toast from 'react-hot-toast';

const GalaxyManager: React.FC = () => {
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSectors();
    }, []);

    const fetchSectors = async () => {
        try {
            setLoading(true);
            const res = await adminService.getSectors();
            if (res.success && res.data) {
                setSectors(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load sectors');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async (sectorId: string) => {
        if (!window.confirm(`Are you sure you want to REGENERATE sector ${sectorId}? This will reset it to default state.`)) return;

        try {
            const res = await adminService.regenerateSector(sectorId);
            if (res.success && res.data) {
                toast.success(`Sector ${sectorId} regenerated.`);
                setSectors(prev => prev.map(s => s.id === sectorId ? res.data! : s));
                if (selectedSector?.id === sectorId) setSelectedSector(res.data);
            }
        } catch (error) {
            toast.error('Regeneration failed');
        }
    };

    const clearOwner = async () => {
        if (!selectedSector) return;
        try {
            const res = await adminService.updateSector(selectedSector.id, { resetOwner: true });
            if (res.success && res.data) {
                toast.success('Owner cleared.');
                setSectors(prev => prev.map(s => s.id === selectedSector.id ? res.data! : s));
                setSelectedSector(res.data);
            }
        } catch (err) { toast.error('Failed'); }
    };

    const setMaxDefense = async () => {
        if (!selectedSector) return;
        try {
            const res = await adminService.updateSector(selectedSector.id, { difficulty: 10 });
            if (res.success && res.data) {
                toast.success('Sector fortified (Diff 10).');
                setSectors(prev => prev.map(s => s.id === selectedSector.id ? res.data! : s));
                setSelectedSector(res.data);
            }
        } catch (err) { toast.error('Failed'); }
    };

    const filteredSectors = sectors.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="text-center p-4 text-cyan-500 animate-pulse">Scanning Galaxy...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {/* List Panel */}
            <div className="md:col-span-1 border border-cyan-900/50 bg-black/40 rounded flex flex-col">
                <div className="p-3 border-b border-cyan-900/50">
                    <input
                        type="text"
                        placeholder="Search Sectors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/50 border border-cyan-800 rounded px-2 py-1 text-sm text-cyan-100 focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredSectors.map(sector => (
                        <div
                            key={sector.id}
                            onClick={() => setSelectedSector(sector)}
                            className={`p-2 rounded cursor-pointer text-xs border border-transparent transition-colors ${selectedSector?.id === sector.id ? 'bg-cyan-900/40 border-cyan-500' : 'hover:bg-cyan-900/20'}`}
                        >
                            <div className="font-bold text-cyan-300">{sector.name}</div>
                            <div className="flex justify-between text-gray-400">
                                <span>{sector.id}</span>
                                <span style={{ color: getDangerColor(sector.difficulty) }}>Diff: {sector.difficulty}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Panel */}
            <div className="md:col-span-2 border border-cyan-900/50 bg-black/40 rounded p-4 relative overflow-hidden">
                {selectedSector ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start border-b border-cyan-900 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-cyan-400">{selectedSector.name}</h2>
                                <p className="text-xs text-cyan-600 font-mono uppercase tracking-widest">{selectedSector.id} :: {selectedSector.type}</p>
                            </div>
                            <div className="text-right text-xs">
                                <div>Coordinates: [{selectedSector.x}, {selectedSector.y}]</div>
                                <div>Connections: {selectedSector.connections.length}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <InfoCard label="Difficulty" value={selectedSector.difficulty} color={getDangerColor(selectedSector.difficulty)} />
                            <InfoCard label="Owner" value={selectedSector.ownerAllianceId || 'NEUTRAL'} color={selectedSector.ownerAllianceId ? '#ff4444' : '#4ade80'} />
                            <InfoCard label="Defense" value={`${selectedSector.currentDefense || 0} / ${selectedSector.maxDefense || 0}`} />
                            <InfoCard label="Structures" value={selectedSector.structures?.length || 0} />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-black/40 p-2 rounded border border-gray-800">
                                <span className="text-xs text-gray-500 block">Metal</span>
                                <span className="font-mono text-cyan-200">{selectedSector.resources?.metal || 0}</span>
                            </div>
                            <div className="bg-black/40 p-2 rounded border border-gray-800">
                                <span className="text-xs text-gray-500 block">Crystal</span>
                                <span className="font-mono text-purple-200">{selectedSector.resources?.crystal || 0}</span>
                            </div>
                            <div className="bg-black/40 p-2 rounded border border-gray-800">
                                <span className="text-xs text-gray-500 block">Energy</span>
                                <span className="font-mono text-yellow-200">{selectedSector.resources?.energy || 0}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-cyan-900">
                            <h3 className="text-sm font-bold text-cyan-500 mb-3 uppercase">Sector Operations</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleRegenerate(selectedSector.id)}
                                    className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-600 text-yellow-500 rounded text-xs font-bold uppercase transition-all"
                                >
                                    ⚠ Regenerate (Reset)
                                </button>
                                <button
                                    onClick={clearOwner}
                                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-600 text-red-500 rounded text-xs font-bold uppercase transition-all"
                                >
                                    Clear Ownership
                                </button>
                                <button
                                    onClick={setMaxDefense}
                                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-600 text-purple-500 rounded text-xs font-bold uppercase transition-all"
                                >
                                    Set Max Difficulty
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-cyan-900/50">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🌌</div>
                            <div>Select a sector to analyze</div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { bg: #000; }
                .custom-scrollbar::-webkit-scrollbar-thumb { bg: #0891b2; border-radius: 2px; }
            `}</style>
        </div>
    );
};

const InfoCard = ({ label, value, color }: { label: string, value: string | number, color?: string }) => (
    <div className="bg-black/30 border border-cyan-900/30 p-2 rounded">
        <div className="text-[10px] text-cyan-700 uppercase">{label}</div>
        <div className="font-mono text-sm" style={{ color: color || '#fff' }}>{value}</div>
    </div>
);

const getDangerColor = (diff: number) => {
    if (diff <= 2) return '#4ade80';
    if (diff <= 5) return '#facc15';
    if (diff <= 7) return '#fb923c';
    return '#ef4444';
};

export default GalaxyManager;
