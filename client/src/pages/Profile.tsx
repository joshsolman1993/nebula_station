import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socialService from '../services/socialService';

interface ProfileData {
    username: string;
    level: number;
    xp: number;
    rankTitle: string;
    fleetSize: number;
    buildingCount: number;
    totalPower: number;
    accountAge: number;
    totalExpeditions: number;
    ships: {
        scout_drone: number;
        mining_barge: number;
    };
}

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadProfile(user.username);
        }
    }, [user]);

    const loadProfile = async (username: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await socialService.getProfile(username);
            if (response.success) {
                setProfile(response.profile);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-space-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">📡</div>
                    <p className="font-orbitron text-2xl text-neon-cyan animate-pulse">
                        Loading Profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-space-gradient flex items-center justify-center">
                <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="font-rajdhani text-red-400 font-semibold">
                        ⚠️ {error || 'Profile not found'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-space-gradient py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* ID Card */}
                <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-cyan/30 rounded-xl p-8 mb-6 relative overflow-hidden">
                    {/* Decorative corners */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-neon-cyan rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-neon-magenta rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-neon-amber rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-neon-cyan rounded-br-xl"></div>

                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">👤</div>
                        <h1 className="font-orbitron text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent mb-2">
                            {profile.username}
                        </h1>
                        <div className="inline-block px-4 py-2 bg-neon-amber/20 border-2 border-neon-amber rounded-lg">
                            <span className="font-orbitron text-xl font-bold text-neon-amber">
                                {profile.rankTitle}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-deepspace-900/50 rounded-lg border border-neon-cyan/20">
                            <div className="font-orbitron text-3xl font-bold text-neon-cyan mb-1">
                                {profile.level}
                            </div>
                            <div className="font-rajdhani text-sm text-gray-400">Level</div>
                        </div>
                        <div className="text-center p-4 bg-deepspace-900/50 rounded-lg border border-neon-magenta/20">
                            <div className="font-orbitron text-3xl font-bold text-neon-magenta mb-1">
                                {profile.xp.toLocaleString()}
                            </div>
                            <div className="font-rajdhani text-sm text-gray-400">XP</div>
                        </div>
                        <div className="text-center p-4 bg-deepspace-900/50 rounded-lg border border-neon-amber/20">
                            <div className="font-orbitron text-3xl font-bold text-neon-amber mb-1">
                                {profile.totalPower.toLocaleString()}
                            </div>
                            <div className="font-rajdhani text-sm text-gray-400">Power</div>
                        </div>
                        <div className="text-center p-4 bg-deepspace-900/50 rounded-lg border border-green-500/20">
                            <div className="font-orbitron text-3xl font-bold text-green-400 mb-1">
                                {profile.accountAge}
                            </div>
                            <div className="font-rajdhani text-sm text-gray-400">Days</div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Total Expeditions */}
                    <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-cyan/30 rounded-xl p-6">
                        <div className="text-center">
                            <div className="text-4xl mb-3">🚀</div>
                            <h3 className="font-orbitron text-lg font-bold text-neon-cyan mb-2">
                                Total Expeditions
                            </h3>
                            <div className="font-orbitron text-3xl font-bold text-white">
                                {profile.totalExpeditions}
                            </div>
                            <p className="font-rajdhani text-xs text-gray-500 mt-2">
                                Missions Completed
                            </p>
                        </div>
                    </div>

                    {/* Fleet Size */}
                    <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-magenta/30 rounded-xl p-6">
                        <div className="text-center">
                            <div className="text-4xl mb-3">🛸</div>
                            <h3 className="font-orbitron text-lg font-bold text-neon-magenta mb-2">
                                Fleet Size
                            </h3>
                            <div className="font-orbitron text-3xl font-bold text-white">
                                {profile.fleetSize}
                            </div>
                            <p className="font-rajdhani text-xs text-gray-500 mt-2">
                                {profile.ships.scout_drone} Scouts · {profile.ships.mining_barge} Barges
                            </p>
                        </div>
                    </div>

                    {/* Colony Age */}
                    <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-amber/30 rounded-xl p-6">
                        <div className="text-center">
                            <div className="text-4xl mb-3">🏗️</div>
                            <h3 className="font-orbitron text-lg font-bold text-neon-amber mb-2">
                                Colony Age
                            </h3>
                            <div className="font-orbitron text-3xl font-bold text-white">
                                {profile.accountAge}
                            </div>
                            <p className="font-rajdhani text-xs text-gray-500 mt-2">
                                Days in Service
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-cyan/30 rounded-xl p-6">
                    <h3 className="font-orbitron text-xl font-bold text-neon-cyan mb-4">
                        📊 Detailed Statistics
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-deepspace-900/30 rounded-lg border border-gray-700/30">
                            <div className="flex justify-between items-center">
                                <span className="font-rajdhani text-gray-400">Buildings Constructed:</span>
                                <span className="font-orbitron font-bold text-white">{profile.buildingCount}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-deepspace-900/30 rounded-lg border border-gray-700/30">
                            <div className="flex justify-between items-center">
                                <span className="font-rajdhani text-gray-400">Ships Crafted:</span>
                                <span className="font-orbitron font-bold text-white">{profile.fleetSize}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-deepspace-900/30 rounded-lg border border-gray-700/30">
                            <div className="flex justify-between items-center">
                                <span className="font-rajdhani text-gray-400">Rank Title:</span>
                                <span className="font-orbitron font-bold text-neon-amber">{profile.rankTitle}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-deepspace-900/30 rounded-lg border border-gray-700/30">
                            <div className="flex justify-between items-center">
                                <span className="font-rajdhani text-gray-400">Total Power:</span>
                                <span className="font-orbitron font-bold text-neon-magenta">{profile.totalPower.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
