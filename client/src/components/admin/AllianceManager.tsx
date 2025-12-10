import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import type { Alliance } from '../../types';

const AllianceManager: React.FC = () => {
    const [alliances, setAlliances] = useState<Alliance[]>([]);
    const [loading, setLoading] = useState(true);
    const [transferModal, setTransferModal] = useState<{ allianceId: string, allianceName: string } | null>(null);
    const [newLeaderId, setNewLeaderId] = useState('');

    useEffect(() => {
        fetchAlliances();
    }, []);

    const fetchAlliances = async () => {
        setLoading(true);
        try {
            const response = await adminService.getAlliances();
            if (response.success && response.data) {
                setAlliances(response.data);
            }
        } catch (error) {
            toast.error('Failed to load alliances');
        } finally {
            setLoading(false);
        }
    };

    const handleDisband = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to disband ${name}? This action cannot be undone.`)) return;

        try {
            await adminService.disbandAlliance(id);
            toast.success(`Alliance ${name} disbanded`);
            setAlliances(alliances.filter(a => a._id !== id));
        } catch (error) {
            toast.error('Failed to disband alliance');
        }
    };

    const handleTransferSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transferModal || !newLeaderId) return;

        try {
            await adminService.transferAllianceLeadership(transferModal.allianceId, newLeaderId);
            toast.success('Leadership transferred');
            setTransferModal(null);
            setNewLeaderId('');
            fetchAlliances(); // Refresh to see updates
        } catch (error: any) {
            toast.error(error.message || 'Failed to transfer leadership');
        }
    };

    if (loading) return <div className="text-center p-8 text-blue-500 animate-pulse">SCANNING DIPLOMATIC CHANNELS...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-black/60 border border-blue-600/30 p-6 rounded backdrop-blur-sm">
                <h2 className="text-xl font-bold text-blue-500 mb-4 flex items-center gap-2">
                    <span>ALLIANCE REGISTRY</span>
                    <span className="text-xs bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                        {alliances.length} REGISTERED
                    </span>
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-blue-900/20 text-blue-200 font-mono uppercase text-xs">
                            <tr>
                                <th className="p-3">Tag</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Leader</th>
                                <th className="p-3 text-right">Members</th>
                                <th className="p-3 text-right">Resources</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-900/20">
                            {alliances.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500 italic">No alliances formed yet.</td>
                                </tr>
                            ) : (
                                alliances.map(alliance => (
                                    <tr key={alliance._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-bold text-blue-400">
                                            [{alliance.tag}]
                                        </td>
                                        <td className="p-3 font-bold text-white">
                                            {alliance.name}
                                        </td>
                                        <td className="p-3 text-gray-300">
                                            {alliance.leader?.username || <span className="text-red-500">Vacant</span>}
                                        </td>
                                        <td className="p-3 text-right text-gray-400 font-mono">
                                            {alliance.memberCount}
                                        </td>
                                        <td className="p-3 text-right text-xs font-mono text-gray-500">
                                            M:{alliance.resources.metal} C:{alliance.resources.crystal}
                                        </td>
                                        <td className="p-3 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => setTransferModal({ allianceId: alliance._id, allianceName: alliance.name })}
                                                className="px-2 py-1 bg-yellow-900/30 hover:bg-yellow-900/80 border border-yellow-800 text-yellow-400 hover:text-white rounded text-xs transition-all uppercase"
                                                title="Transfer Leadership"
                                            >
                                                👑 Transfer
                                            </button>
                                            <button
                                                onClick={() => handleDisband(alliance._id, alliance.name)}
                                                className="px-2 py-1 bg-red-900/30 hover:bg-red-900/80 border border-red-800 text-red-400 hover:text-white rounded text-xs transition-all uppercase"
                                                title="Disband Alliance"
                                            >
                                                ❌ Disband
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transfer Leadership Modal */}
            {transferModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-yellow-600 p-6 rounded-lg max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-bold text-yellow-500 mb-4">Transfer Leadership</h3>
                        <p className="text-gray-300 mb-4">
                            Select a new leader for <span className="font-bold text-white">{transferModal.allianceName}</span>.
                            <br />
                            <span className="text-xs text-red-400">Note: Enter the User ID of the new leader (must be a member).</span>
                        </p>

                        <form onSubmit={handleTransferSubmit}>
                            <input
                                type="text"
                                value={newLeaderId}
                                onChange={(e) => setNewLeaderId(e.target.value)}
                                placeholder="User ID"
                                className="w-full bg-black border border-gray-700 text-white p-2 rounded mb-4 focus:border-yellow-500 outline-none"
                                required
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTransferModal(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded"
                                >
                                    Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllianceManager;
