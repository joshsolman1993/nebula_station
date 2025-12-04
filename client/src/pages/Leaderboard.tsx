import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socialService from '../services/socialService';

interface LeaderboardEntry {
    username: string;
    level: number;
    xp: number;
    fleetPower: number;
    fleetSize: number;
    buildingCount: number;
}

const Leaderboard = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await socialService.getLeaderboard(10);
            if (response.success) {
                setLeaderboard(response.leaderboard);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load leaderboard');
        } finally {
            setIsLoading(false);
        }
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'from-yellow-400 to-yellow-600'; // Gold
        if (rank === 2) return 'from-gray-300 to-gray-500'; // Silver
        if (rank === 3) return 'from-orange-400 to-orange-600'; // Bronze
        return 'from-neon-cyan to-neon-magenta';
    };

    const getRankGlow = (rank: number) => {
        if (rank === 1) return 'shadow-[0_0_30px_rgba(255,215,0,0.5)]';
        if (rank === 2) return 'shadow-[0_0_30px_rgba(192,192,192,0.5)]';
        if (rank === 3) return 'shadow-[0_0_30px_rgba(205,127,50,0.5)]';
        return '';
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return '👑';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '⭐';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-space-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🔭</div>
                    <p className="font-orbitron text-2xl text-neon-cyan animate-pulse">
                        Scanning Galaxy...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-space-gradient py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-orbitron text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent mb-2">
                        🏆 GALACTIC LEADERBOARD
                    </h1>
                    <p className="font-rajdhani text-gray-400">
                        Top Commanders in the Nebula Sector
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <p className="font-rajdhani text-red-400 font-semibold">⚠️ {error}</p>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-cyan/30 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-deepspace-900/50 border-b-2 border-neon-cyan/30">
                                <tr>
                                    <th className="px-6 py-4 text-left font-orbitron text-sm text-neon-cyan">Rank</th>
                                    <th className="px-6 py-4 text-left font-orbitron text-sm text-neon-cyan">Commander</th>
                                    <th className="px-6 py-4 text-center font-orbitron text-sm text-neon-cyan">Level</th>
                                    <th className="px-6 py-4 text-center font-orbitron text-sm text-neon-cyan">XP</th>
                                    <th className="px-6 py-4 text-center font-orbitron text-sm text-neon-cyan">Fleet Power</th>
                                    <th className="px-6 py-4 text-center font-orbitron text-sm text-neon-cyan">Fleet</th>
                                    <th className="px-6 py-4 text-center font-orbitron text-sm text-neon-cyan">Buildings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, index) => {
                                    const rank = index + 1;
                                    const isCurrentUser = user?.username === entry.username;

                                    return (
                                        <tr
                                            key={entry.username}
                                            className={`
                        border-b border-gray-700/30 transition-all duration-300
                        ${isCurrentUser ? 'bg-neon-amber/10 border-neon-amber/50' : 'hover:bg-deepspace-900/30'}
                        ${rank <= 3 ? getRankGlow(rank) : ''}
                      `}
                                        >
                                            {/* Rank */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{getRankIcon(rank)}</span>
                                                    <span
                                                        className={`font-orbitron text-xl font-bold ${rank <= 3
                                                                ? `bg-gradient-to-r ${getRankColor(rank)} bg-clip-text text-transparent`
                                                                : 'text-gray-400'
                                                            }`}
                                                    >
                                                        #{rank}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Commander Name */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-orbitron font-bold text-white">
                                                        {entry.username}
                                                    </span>
                                                    {isCurrentUser && (
                                                        <span className="text-xs font-rajdhani bg-neon-amber/20 text-neon-amber px-2 py-1 rounded">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Level */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-orbitron text-lg font-bold text-neon-cyan">
                                                    {entry.level}
                                                </span>
                                            </td>

                                            {/* XP */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-rajdhani text-gray-400">
                                                    {entry.xp.toLocaleString()}
                                                </span>
                                            </td>

                                            {/* Fleet Power */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-orbitron text-lg font-bold text-neon-magenta">
                                                    {entry.fleetPower.toLocaleString()}
                                                </span>
                                            </td>

                                            {/* Fleet Size */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-rajdhani text-gray-400">
                                                    {entry.fleetSize} 🚀
                                                </span>
                                            </td>

                                            {/* Buildings */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-rajdhani text-gray-400">
                                                    {entry.buildingCount} 🏗️
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Your Rank (if not in top 10) */}
                {user && !leaderboard.some(e => e.username === user.username) && (
                    <div className="mt-6 p-4 bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-amber/30 rounded-xl">
                        <p className="font-rajdhani text-center text-gray-400">
                            Your rank: <span className="text-neon-amber font-bold">Not in Top 10</span>
                            <br />
                            <span className="text-sm">Keep building and exploring to climb the ranks!</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
