import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminService, type AdminStats } from '../services/adminService';
import type { User } from '../types';

const AdminDashboard: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        fetchData();
    }, [isAuthenticated, user, navigate]);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                adminService.getStats(),
                adminService.getUsers()
            ]);
            if (statsRes.success && statsRes.data) setStats(statsRes.data);
            if (usersRes.success && usersRes.data) setUsers(usersRes.data);
        } catch (error) {
            console.error('Failed to fetch admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGiveResources = async (type: 'metal' | 'crystal' | 'energy' | 'credits', amount: number) => {
        if (!selectedUser) return;
        try {
            const resources = { [type]: amount };
            const res = await adminService.giveResources(selectedUser.id, resources); // Assuming User type has _id or id. Mongoose uses _id but frontend might map it.
            // Wait, the User type in index.ts has `id`.
            if (res.success) {
                setActionMessage(`Successfully gave ${amount} ${type} to ${selectedUser.username}`);
                fetchData(); // Refresh data
            }
        } catch (error) {
            console.error('Action failed', error);
            setActionMessage('Action failed');
        }
    };

    const handleResetUser = async () => {
        if (!selectedUser || !window.confirm(`Are you sure you want to RESET ${selectedUser.username}? This cannot be undone.`)) return;
        try {
            const res = await adminService.resetUser(selectedUser.id);
            if (res.success) {
                setActionMessage(`User ${selectedUser.username} has been reset.`);
                fetchData();
            }
        } catch (error) {
            console.error('Reset failed', error);
            setActionMessage('Reset failed');
        }
    };

    if (loading) return <div className="p-10 text-center text-red-500">ACCESSING HIGH COUNCIL ARCHIVES...</div>;

    return (
        <div className="min-h-screen bg-black text-red-500 font-mono p-6" style={{ backgroundImage: 'radial-gradient(circle at center, #2a0a0a 0%, #000000 100%)' }}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 border-b-2 border-red-600 pb-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold tracking-wider text-red-600 uppercase glow-text">The High Council</h1>
                        <p className="text-red-400 text-sm mt-1">:: GOD MODE ACTIVATED :: COMMANDER {user?.username.toUpperCase()} ::</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-red-800">SYSTEM STATUS</div>
                        <div className="text-xl font-bold text-green-500">ONLINE</div>
                    </div>
                </header>

                {/* Stats Panel */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="TOTAL USERS" value={stats?.totalUsers || 0} />
                    <StatCard label="TOTAL SHIPS" value={stats?.totalShips || 0} />
                    <StatCard label="TOTAL CREDITS" value={stats?.totalCredits?.toLocaleString() || 0} />
                    <StatCard label="UPTIME (s)" value={Math.floor(stats?.uptime || 0)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User List */}
                    <div className="lg:col-span-2 border border-red-900 bg-black/50 p-4 rounded backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-4 border-b border-red-900 pb-2">:: DETECTED LIFEFORMS ::</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="text-red-700 border-b border-red-900">
                                        <th className="p-2">USERNAME</th>
                                        <th className="p-2">ROLE</th>
                                        <th className="p-2">LEVEL</th>
                                        <th className="p-2">LAST LOGIN</th>
                                        <th className="p-2">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className={`border-b border-red-900/30 hover:bg-red-900/20 transition-colors ${selectedUser?.id === u.id ? 'bg-red-900/40' : ''}`}>
                                            <td className="p-2 font-bold">{u.username}</td>
                                            <td className="p-2">{u.role}</td>
                                            <td className="p-2">{u.level}</td>
                                            <td className="p-2">{new Date(u.lastLogin).toLocaleDateString()}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => setSelectedUser(u)}
                                                    className="px-3 py-1 bg-red-900 hover:bg-red-700 text-white text-xs rounded uppercase"
                                                >
                                                    Select
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div className="border border-red-600 bg-red-950/10 p-4 rounded backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-4 border-b border-red-600 pb-2">:: COMMAND INTERFACE ::</h2>

                        {/* System Broadcast */}
                        <div className="mb-6 pb-6 border-b border-red-900">
                            <p className="text-xs font-bold text-red-400 uppercase mb-2">System Broadcast</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="broadcast-input"
                                    placeholder="Transmit global message..."
                                    className="flex-1 bg-black/40 border border-red-800 rounded px-2 py-1 text-sm text-red-100 placeholder-red-900 focus:outline-none focus:border-red-500"
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('broadcast-input') as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                            // We need to emit this via socket. 
                                            // Since we don't have direct access to the socket instance here (it's in ChatWidget),
                                            // we can cheat slightly by creating a temporary socket connection OR 
                                            // better yet, expose a broadcast endpoint in the admin API.
                                            // For now, let's use the socket directly if we can, but we can't easily share the instance.
                                            // Let's use a custom event or just a simple socket emit since we are admin.

                                            // Actually, the cleanest way is to use the existing socket connection if we could access it.
                                            // But since we can't, let's just make a quick connection or use a window event to trigger ChatWidget.
                                            // Let's try dispatching a custom event that ChatWidget listens to? No, that's hacky.

                                            // Let's use a new socket connection just for this action. It's not efficient but works for MVP.
                                            // OR, better: Add a 'broadcast' endpoint to the Admin API and let the server emit the message.
                                            // That is the ARCHITECTURALLY CORRECT way.

                                            // However, the user instructions said: "Az AdminDashboard-on hozz létre egy egyszerű input mezőt... Ha az Admin innen küld üzenetet..."
                                            // It implies frontend logic, but server-side broadcast is safer.

                                            // Let's implement a quick client-side emit for now to satisfy the "socket.io" requirement directly.
                                            import('socket.io-client').then(({ io }) => {
                                                const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
                                                socket.emit('send_message', {
                                                    sender: 'HIGH COUNCIL',
                                                    text: input.value,
                                                    role: 'admin',
                                                    type: 'admin'
                                                });
                                                input.value = '';
                                                setActionMessage('Broadcast transmitted.');
                                                setTimeout(() => socket.disconnect(), 1000);
                                            });
                                        }
                                    }}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-black font-bold uppercase text-xs rounded"
                                >
                                    SEND
                                </button>
                            </div>
                        </div>

                        {selectedUser ? (
                            <div className="space-y-4">
                                <div className="bg-black/40 p-3 rounded border border-red-900">
                                    <div className="text-xs text-red-500 uppercase">Target Locked</div>
                                    <div className="text-lg font-bold text-white">{selectedUser.username}</div>
                                    <div className="text-xs text-gray-400">{selectedUser.email}</div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                        <div>Metal: {selectedUser.resources?.metal || 0}</div>
                                        <div>Crystal: {selectedUser.resources?.crystal || 0}</div>
                                        <div>Energy: {selectedUser.resources?.energy || 0}</div>
                                        <div>Credits: {selectedUser.resources?.credits || 0}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-red-400 uppercase">Inject Resources</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <ActionButton onClick={() => handleGiveResources('metal', 10000)} label="+10k Metal" />
                                        <ActionButton onClick={() => handleGiveResources('crystal', 10000)} label="+10k Crystal" />
                                        <ActionButton onClick={() => handleGiveResources('energy', 10000)} label="+10k Energy" />
                                        <ActionButton onClick={() => handleGiveResources('credits', 10000)} label="+10k Credits" />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-red-900">
                                    <p className="text-xs font-bold text-red-400 uppercase">Punitive Measures</p>
                                    <button
                                        onClick={handleResetUser}
                                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-black font-bold uppercase text-sm rounded shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                                    >
                                        ⚠ RESET USER PROGRESS
                                    </button>
                                </div>

                                {actionMessage && (
                                    <div className="mt-4 p-2 bg-black border border-green-500 text-green-500 text-xs font-mono">
                                        &gt; {actionMessage}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-red-800 italic">
                                &lt; SELECT A TARGET TO BEGIN MANIPULATION &gt;
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .glow-text {
                    text-shadow: 0 0 10px rgba(220, 38, 38, 0.7);
                }
            `}</style>
        </div>
    );
};

const StatCard = ({ label, value }: { label: string, value: number | string }) => (
    <div className="bg-black/60 border border-red-800 p-4 rounded">
        <div className="text-xs text-red-500 mb-1">{label}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
    </div>
);

const ActionButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
    <button
        onClick={onClick}
        className="py-2 bg-red-900/50 hover:bg-red-800 border border-red-700 text-red-100 text-xs font-bold uppercase rounded transition-all"
    >
        {label}
    </button>
);

export default AdminDashboard;
