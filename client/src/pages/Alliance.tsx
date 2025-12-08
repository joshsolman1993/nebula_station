import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Shield, Award, Coins, UserPlus, LogOut, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Member {
    _id: string;
    username: string;
    role: string;
    allianceRole: string;
    level: number;
    lastLogin: string;
}

interface AllianceData {
    _id: string;
    name: string;
    tag: string;
    level: number;
    members: Member[];
    leader: { _id: string; username: string };
    resources: {
        metal: number;
        crystal: number;

        credits: number;
    };
    color?: string;
}

interface AllianceListItem {
    _id: string;
    name: string;
    tag: string;
    level: number;
    memberCount: number;
}

const Alliance = () => {
    const { user, refreshUser } = useAuth();
    const [myAlliance, setMyAlliance] = useState<AllianceData | null>(null);
    const [alliances, setAlliances] = useState<AllianceListItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Forms
    const [createName, setCreateName] = useState('');
    const [createTag, setCreateTag] = useState('');
    const [createColor, setCreateColor] = useState('#3b82f6');
    const [donateAmount, setDonateAmount] = useState(100);
    const [donateType, setDonateType] = useState('credits');

    useEffect(() => {
        if (user?.alliance) {
            fetchMyAlliance();
        } else {
            fetchAlliances();
        }
    }, [user?.alliance?._id]);

    const fetchMyAlliance = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance/my-alliance', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMyAlliance(data.alliance);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAlliances = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAlliances(data.alliances);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: createName, tag: createTag, color: createColor })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Alliance created!');
                refreshUser();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleJoin = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ allianceId: id })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Joined alliance!');
                refreshUser();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLeave = async () => {
        if (!confirm('Are you sure you want to leave?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance/leave', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Left alliance.');
                refreshUser();
                setMyAlliance(null);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDonate = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/alliance/donate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ resource: donateType, amount: Number(donateAmount) })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Donation successful!');
                fetchMyAlliance();
                refreshUser();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="p-6 text-white">Loading Alliance Data...</div>;

    // View: Member of an Alliance
    if (user?.alliance && myAlliance) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-900/10 z-0"></div>
                    <div className="z-10 flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white border-2 border-blue-400">
                            {myAlliance.tag}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{myAlliance.name}</h1>
                            <div className="flex items-center gap-4 text-gray-400 mt-1">
                                <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Level {myAlliance.level}</span>
                                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {myAlliance.members.length} Members</span>
                                <span className="text-blue-400 font-bold">Leader: {myAlliance.leader?.username}</span>
                            </div>
                        </div>
                    </div>
                    <div className="z-10">
                        <button
                            onClick={handleLeave}
                            className="bg-red-900/50 hover:bg-red-800 text-red-200 px-4 py-2 rounded border border-red-700 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" /> Leave Alliance
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bank & Donations */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Coins className="text-yellow-500" /> Alliance Bank
                            </h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between bg-gray-900 p-3 rounded">
                                    <span className="text-gray-400">Credits</span>
                                    <span className="text-yellow-400 font-bold">{myAlliance.resources.credits.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between bg-gray-900 p-3 rounded">
                                    <span className="text-gray-400">Metal</span>
                                    <span className="text-blue-300 font-bold">{myAlliance.resources.metal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between bg-gray-900 p-3 rounded">
                                    <span className="text-gray-400">Crystal</span>
                                    <span className="text-purple-300 font-bold">{myAlliance.resources.crystal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-4">
                                <h4 className="text-white font-bold mb-2">Donate Resources</h4>
                                <div className="space-y-2">
                                    <select
                                        value={donateType}
                                        onChange={(e) => setDonateType(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 text-white rounded p-2"
                                    >
                                        <option value="credits">Credits</option>
                                        <option value="metal">Metal</option>
                                        <option value="crystal">Crystal</option>
                                    </select>
                                    <input
                                        type="number"
                                        value={donateAmount}
                                        onChange={(e) => setDonateAmount(Number(e.target.value))}
                                        className="w-full bg-gray-900 border border-gray-600 text-white rounded p-2"
                                        min="1"
                                    />
                                    <button
                                        onClick={handleDonate}
                                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded mt-2"
                                    >
                                        Donate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Member List */}
                    <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Users className="text-blue-400" /> Roster
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-gray-300">
                                <thead className="text-gray-500 border-b border-gray-700">
                                    <tr>
                                        <th className="pb-2">Commander</th>
                                        <th className="pb-2">Role</th>
                                        <th className="pb-2">Level</th>
                                        <th className="pb-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {myAlliance.members.map(member => (
                                        <tr key={member._id} className="group hover:bg-gray-700/50">
                                            <td className="py-3 font-bold text-white">{member.username}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${member.allianceRole === 'Leader' ? 'bg-yellow-500/20 text-yellow-500' :
                                                    member.allianceRole === 'Officer' ? 'bg-blue-500/20 text-blue-500' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                    {member.allianceRole || 'Member'}
                                                </span>
                                            </td>
                                            <td className="py-3">{member.level}</td>
                                            <td className="py-3 text-xs text-gray-500">
                                                {new Date(member.lastLogin).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // View: Alliance Finder / Create
    return (
        <div className="p-6 max-w-7xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-500" /> Alliance Command
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Alliance List */}
                <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Public Alliances</h2>
                    <div className="space-y-4">
                        {alliances.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">No alliances found. Be the first to create one!</div>
                        ) : (
                            alliances.map(alliance => (
                                <div key={alliance._id} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center border border-gray-700 hover:border-gray-500 transition-colors">
                                    <div>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            <span className="bg-blue-900 text-blue-300 text-xs px-1 rounded border border-blue-700">[{alliance.tag}]</span>
                                            {alliance.name}
                                        </div>
                                        <div className="text-sm text-gray-400">Level {alliance.level} • {alliance.memberCount} Members</div>
                                    </div>
                                    <button
                                        onClick={() => handleJoin(alliance._id)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2"
                                    >
                                        <UserPlus className="w-4 h-4" /> Join
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Create Alliance Form */}
                <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6 h-fit bg-gradient-to-b from-gray-900 to-gray-800">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Award className="text-yellow-500" /> Found New Alliance
                    </h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Establish a new power in the galaxy. Leaders can manage members, set goals, and access the alliance bank.
                    </p>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Alliance Name</label>
                            <input
                                type="text"
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                                placeholder="e.g. The Voidwalkers"
                                required
                                minLength={3}
                                maxLength={30}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Tag (2-4 chars)</label>
                            <input
                                type="text"
                                value={createTag}
                                onChange={(e) => setCreateTag(e.target.value.toUpperCase())}
                                className="w-full bg-black/50 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none font-mono"
                                placeholder="VOID"
                                required
                                minLength={2}
                                maxLength={4}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Alliance Color</label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    value={createColor}
                                    onChange={(e) => setCreateColor(e.target.value)}
                                    className="h-10 w-20 bg-transparent border border-gray-600 rounded cursor-pointer"
                                />
                                <span className="text-gray-400 text-xs">Map Territory Color</span>
                            </div>
                        </div>

                        <div className="bg-black/30 p-3 rounded flex justify-between items-center text-sm">
                            <span className="text-gray-400">Creation Cost</span>
                            <span className="text-yellow-400 font-bold">1,000 Credits</span>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded flex items-center justify-center gap-2 mt-4"
                        >
                            Create Alliance <ArrowRightCircle className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default Alliance;
