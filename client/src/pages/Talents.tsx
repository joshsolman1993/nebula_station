import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSound } from '../contexts/SoundContext';
import { Shield, Pickaxe, Zap, Lock, ArrowUp, Star } from 'lucide-react';

// Define Talent Types locally for now, or import from shared config if available
interface Talent {
    id: string;
    name: string;
    description: string;
    branch: 'INDUSTRIALIST' | 'WARLORD' | 'SCIENTIST';
    tier: number;
    maxLevel: number;
    effect: {
        type: string;
        value: number;
    };
}

const TALENTS: Record<string, Talent[]> = {
    INDUSTRIALIST: [
        {
            id: 'efficient_mining',
            name: 'Efficient Mining',
            description: 'Increases Metal and Crystal production by 5% per level.',
            branch: 'INDUSTRIALIST',
            tier: 1,
            maxLevel: 5,
            effect: { type: 'production_bonus', value: 0.05 }
        },
        {
            id: 'cargo_optimization',
            name: 'Cargo Optimization',
            description: 'Increases resource storage capacity by 10% per level.',
            branch: 'INDUSTRIALIST',
            tier: 2,
            maxLevel: 3,
            effect: { type: 'storage_bonus', value: 0.10 }
        },
        {
            id: 'master_builder',
            name: 'Master Builder',
            description: 'Reduces building construction costs by 10% per level.',
            branch: 'INDUSTRIALIST',
            tier: 3,
            maxLevel: 1,
            effect: { type: 'cost_reduction', value: 0.10 }
        }
    ],
    WARLORD: [
        {
            id: 'targeting_systems',
            name: 'Targeting Systems',
            description: 'Increases Fleet Attack Power by 5% per level.',
            branch: 'WARLORD',
            tier: 1,
            maxLevel: 5,
            effect: { type: 'attack_bonus', value: 0.05 }
        },
        {
            id: 'reinforced_hulls',
            name: 'Reinforced Hulls',
            description: 'Increases Fleet Hit Points by 10% per level.',
            branch: 'WARLORD',
            tier: 2,
            maxLevel: 3,
            effect: { type: 'hp_bonus', value: 0.10 }
        },
        {
            id: 'scavenger',
            name: 'Scavenger',
            description: 'Increases chance to find artifacts in battle by 15% per level.',
            branch: 'WARLORD',
            tier: 3,
            maxLevel: 1,
            effect: { type: 'loot_bonus', value: 0.15 }
        }
    ],
    SCIENTIST: [
        {
            id: 'overclocking',
            name: 'Overclocking',
            description: 'Increases Energy production by 5% per level.',
            branch: 'SCIENTIST',
            tier: 1,
            maxLevel: 5,
            effect: { type: 'energy_bonus', value: 0.05 }
        },
        {
            id: 'neural_network',
            name: 'Neural Network',
            description: 'Increases XP gain by 10% per level.',
            branch: 'SCIENTIST',
            tier: 2,
            maxLevel: 3,
            effect: { type: 'xp_bonus', value: 0.10 }
        },
        {
            id: 'eureka_moment',
            name: 'Eureka Moment',
            description: 'Reduces Research costs by 10% per level.',
            branch: 'SCIENTIST',
            tier: 3,
            maxLevel: 1,
            effect: { type: 'research_cost_reduction', value: 0.10 }
        }
    ]
};

const Talents: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { playSfx } = useSound();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLearn = async (talentId: string) => {
        if (!user || user.talentPoints < 1) return;

        setLoading(talentId);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/game/talents/learn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ talentId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to learn talent');
            }

            playSfx('success'); // Or a specific 'levelup' sound
            await refreshUser();
        } catch (err: any) {
            setError(err.message);
            playSfx('error');
        } finally {
            setLoading(null);
        }
    };

    const getBranchIcon = (branch: string) => {
        switch (branch) {
            case 'INDUSTRIALIST': return <Pickaxe className="w-6 h-6 text-blue-400" />;
            case 'WARLORD': return <Shield className="w-6 h-6 text-red-400" />;
            case 'SCIENTIST': return <Zap className="w-6 h-6 text-green-400" />;
            default: return <Star className="w-6 h-6" />;
        }
    };

    const getBranchColor = (branch: string) => {
        switch (branch) {
            case 'INDUSTRIALIST': return 'border-blue-500/30 bg-blue-900/10';
            case 'WARLORD': return 'border-red-500/30 bg-red-900/10';
            case 'SCIENTIST': return 'border-green-500/30 bg-green-900/10';
            default: return 'border-gray-700 bg-gray-800/50';
        }
    };

    if (!user) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Star className="w-8 h-8 text-yellow-400" />
                        Commander's Path
                    </h1>
                    <p className="text-gray-400">Specialize your station and fleet.</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-400 uppercase tracking-wider">Available Points</div>
                    <div className="text-4xl font-bold text-yellow-400 drop-shadow-glow">{user.talentPoints}</div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {/* Talent Branches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(TALENTS).map(([branchName, talents]) => (
                    <div key={branchName} className="space-y-4">
                        <div className={`p-4 rounded-lg border flex items-center gap-3 ${getBranchColor(branchName)}`}>
                            {getBranchIcon(branchName)}
                            <h2 className="text-xl font-bold text-white capitalize">{branchName.toLowerCase()}</h2>
                        </div>

                        <div className="space-y-4 relative">
                            {/* Connector Line (Visual only) */}
                            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-700 -z-10" />

                            {talents.map((talent) => {
                                const currentLevel = user.talents?.[talent.id] || 0;
                                const isMaxed = currentLevel >= talent.maxLevel;

                                // Check requirements
                                let isLocked = false;
                                if (talent.tier > 1) {
                                    // Calculate points in this branch
                                    const pointsInBranch = talents.reduce((acc, t) => acc + (user.talents?.[t.id] || 0), 0);
                                    const requiredPoints = (talent.tier - 1) * 5;
                                    if (pointsInBranch < requiredPoints) isLocked = true;
                                }

                                const canAfford = user.talentPoints > 0;

                                return (
                                    <div
                                        key={talent.id}
                                        className={`
                                            relative p-4 rounded-lg border transition-all duration-300
                                            ${isLocked ? 'opacity-50 grayscale border-gray-800 bg-gray-900' : 'bg-gray-800/80 border-gray-700 hover:border-gray-500'}
                                            ${currentLevel > 0 ? 'border-l-4 ' + (branchName === 'INDUSTRIALIST' ? 'border-l-blue-500' : branchName === 'WARLORD' ? 'border-l-red-500' : 'border-l-green-500') : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-white flex items-center gap-2">
                                                    {talent.name}
                                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">Tier {talent.tier}</span>
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-1">{talent.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-mono ${isMaxed ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                    {currentLevel} / {talent.maxLevel}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end">
                                            {isLocked ? (
                                                <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded bg-gray-800 text-gray-500 cursor-not-allowed text-sm">
                                                    <Lock className="w-4 h-4" />
                                                    Locked
                                                </button>
                                            ) : isMaxed ? (
                                                <button disabled className="flex items-center gap-2 px-3 py-1.5 rounded bg-yellow-500/20 text-yellow-400 cursor-default text-sm border border-yellow-500/30">
                                                    <Star className="w-4 h-4" />
                                                    Maxed
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleLearn(talent.id)}
                                                    disabled={!canAfford || loading === talent.id}
                                                    className={`
                                                        flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors
                                                        ${canAfford
                                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                                                    `}
                                                >
                                                    {loading === talent.id ? (
                                                        <span className="animate-spin">⌛</span>
                                                    ) : (
                                                        <ArrowUp className="w-4 h-4" />
                                                    )}
                                                    Upgrade
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Talents;
