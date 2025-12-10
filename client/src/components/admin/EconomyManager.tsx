import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import type { MarketListing } from '../../types';

const EconomyManager: React.FC = () => {
    const [multipliers, setMultipliers] = useState({
        metal: 1.0,
        crystal: 1.0,
        energy: 1.0
    });
    const [listings, setListings] = useState<MarketListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [configRes, marketRes] = await Promise.all([
                adminService.getGlobalConfig(),
                adminService.getMarketListings()
            ]);

            if (configRes.success && configRes.data) {
                setMultipliers({
                    metal: Number(configRes.data['RESOURCE_MULTIPLIER_METAL']) || 1.0,
                    crystal: Number(configRes.data['RESOURCE_MULTIPLIER_CRYSTAL']) || 1.0,
                    energy: Number(configRes.data['RESOURCE_MULTIPLIER_ENERGY']) || 1.0
                });
            }

            if (marketRes.success && marketRes.data) {
                setListings(marketRes.data);
            }
        } catch (error) {
            toast.error('Failed to load economy data');
        } finally {
            setLoading(false);
        }
    };

    const handleMultiplierChange = async (resource: 'metal' | 'crystal' | 'energy', value: number) => {
        const keyMap = {
            metal: 'RESOURCE_MULTIPLIER_METAL',
            crystal: 'RESOURCE_MULTIPLIER_CRYSTAL',
            energy: 'RESOURCE_MULTIPLIER_ENERGY'
        };

        try {
            setMultipliers(prev => ({ ...prev, [resource]: value }));
            await adminService.updateGlobalConfig(keyMap[resource], value);
            toast.success(`${resource.toUpperCase()} multiplier updated to ${value}x`);
        } catch (error) {
            toast.error('Failed to update multiplier');
            fetchData(); // Revert on error
        }
    };

    const handleDeleteListing = async (id: string) => {
        if (!window.confirm('Delete this listing? Items will be returned to seller.')) return;
        try {
            await adminService.deleteMarketListing(id);
            toast.success('Listing deleted');
            setListings(listings.filter(l => l._id !== id));
        } catch (error) {
            toast.error('Failed to delete listing');
        }
    };

    if (loading) return <div className="text-center p-8 text-yellow-500 animate-pulse">ANALYZING ECONOMIC METRICS...</div>;

    return (
        <div className="space-y-6">
            {/* Multipliers Section */}
            <div className="bg-black/60 border border-yellow-600/30 p-6 rounded relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <span className="text-8xl">📈</span>
                </div>
                <h2 className="text-xl font-bold text-yellow-500 mb-6 flex items-center gap-2">
                    <span>GLOBAL PRODUCTION MULTIPLIERS</span>
                    <span className="text-xs bg-yellow-900/50 text-yellow-200 px-2 py-0.5 rounded border border-yellow-700">LIVE</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <MultiplierControl
                        label="Metal Production"
                        value={multipliers.metal}
                        onChange={(v) => handleMultiplierChange('metal', v)}
                        color="text-cyan-400"
                    />
                    <MultiplierControl
                        label="Crystal Synthesis"
                        value={multipliers.crystal}
                        onChange={(v) => handleMultiplierChange('crystal', v)}
                        color="text-purple-400"
                    />
                    <MultiplierControl
                        label="Energy Output"
                        value={multipliers.energy}
                        onChange={(v) => handleMultiplierChange('energy', v)}
                        color="text-yellow-400"
                    />
                </div>
            </div>

            {/* Market Oversight Section */}
            <div className="bg-black/60 border border-yellow-600/30 p-6 rounded backdrop-blur-sm">
                <h2 className="text-xl font-bold text-yellow-500 mb-4">MARKET OVERSIGHT</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-yellow-900/20 text-yellow-200 font-mono uppercase text-xs">
                            <tr>
                                <th className="p-3">Seller</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Content</th>
                                <th className="p-3 text-right">Price</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-yellow-900/20">
                            {listings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">No active market listings.</td>
                                </tr>
                            ) : (
                                listings.map(listing => (
                                    <tr key={listing._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-gray-300">
                                            {listing.seller?.username || 'Unknown'}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${listing.type === 'RESOURCE' ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                                                }`}>
                                                {listing.type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-300 font-mono">
                                            {listing.type === 'RESOURCE'
                                                ? `${listing.content.amount} ${listing.content.resourceType}`
                                                : listing.content.name || 'Artifact'
                                            }
                                        </td>
                                        <td className="p-3 text-right font-bold text-yellow-400">
                                            {listing.price} CR
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => handleDeleteListing(listing._id)}
                                                className="px-3 py-1 bg-red-900/30 hover:bg-red-900/80 border border-red-800 text-red-400 hover:text-white rounded text-xs transition-all uppercase"
                                            >
                                                Delist
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const MultiplierControl = ({ label, value, onChange, color }: { label: string, value: number, onChange: (v: number) => void, color: string }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center">
            <span className={`text-sm font-bold uppercase tracking-wider ${color || 'text-white'}`}>{label}</span>
            <span className="font-mono text-xl font-bold bg-black/50 px-3 py-1 rounded border border-gray-800">{value.toFixed(1)}x</span>
        </div>
        <input
            type="range"
            min="0.5"
            max="10.0"
            step="0.1"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
        />
        <div className="flex justify-between text-xs text-gray-500 font-mono">
            <span>0.5x</span>
            <span>10.0x</span>
        </div>
    </div>
);

export default EconomyManager;
