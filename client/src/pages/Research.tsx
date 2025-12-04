import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gameService from '../services/gameService';
import { TECHNOLOGIES, type Technology } from '../config/gameData';
import { Brain, Lock, Check, Zap, Hammer, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';

const Research = () => {
    const { user } = useAuth();
    const [completedResearch, setCompletedResearch] = useState<string[]>([]);
    const [stationLayout, setStationLayout] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResearching, setIsResearching] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await gameService.getStation();
            if (response.success) {
                setCompletedResearch(response.user.completedResearch || []);
                setStationLayout(response.station.layout);
            }
        } catch (err: any) {
            toast.error('Failed to load research data');
        } finally {
            setIsLoading(false);
        }
    };

    const hasResearchLab = stationLayout.some((b) => b.buildingId === 'research_lab');

    const canAfford = (tech: Technology) => {
        if (!user) return false;
        return (
            user.resources.metal >= tech.cost.metal &&
            user.resources.crystal >= tech.cost.crystal &&
            user.resources.energy >= tech.cost.energy &&
            user.credits >= tech.cost.credits
        );
    };

    const handleResearch = async (techId: string) => {
        if (!hasResearchLab) {
            toast.error('Research Lab required!');
            return;
        }

        setIsResearching(true);
        try {
            const response = await gameService.researchTechnology(techId);
            if (response.success) {
                toast.success(response.message, { icon: '🧪' });
                setCompletedResearch(response.user.completedResearch);
                // Update user resources in context would be ideal here, but for now we reload
                // In a real app, we'd update the auth context user state
                window.location.reload(); // Simple way to refresh resources in context
            }
        } catch (err: any) {
            toast.error(err.message || 'Research failed');
        } finally {
            setIsResearching(false);
        }
    };

    const getTechIcon = (iconName: string) => {
        switch (iconName) {
            case '⚡': return <Zap className="w-8 h-8" />;
            case '🏗️': return <Hammer className="w-8 h-8" />;
            case '🚀': return <Rocket className="w-8 h-8" />;
            default: return <Brain className="w-8 h-8" />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-space-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🧪</div>
                    <p className="font-orbitron text-2xl text-neon-cyan animate-pulse">
                        Analyzing Data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-space-gradient py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="font-orbitron text-4xl font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3">
                        <Brain className="w-10 h-10 text-neon-cyan" />
                        RESEARCH CENTER
                    </h1>
                    <p className="font-rajdhani text-gray-400">
                        Unlock advanced technologies to expand your station
                    </p>
                </div>

                {!hasResearchLab && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-center">
                        <p className="font-rajdhani text-red-400 font-bold text-lg">
                            ⚠️ Research Lab Required
                        </p>
                        <p className="text-sm text-gray-400">
                            Build a Research Lab in the Command Center to start researching.
                        </p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TECHNOLOGIES.map((tech) => {
                        const isCompleted = completedResearch.includes(tech.id);
                        const affordable = canAfford(tech);
                        const isLocked = !hasResearchLab && !isCompleted;

                        return (
                            <div
                                key={tech.id}
                                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-300
                  ${isCompleted
                                        ? 'bg-green-900/20 border-green-500/50'
                                        : isLocked
                                            ? 'bg-gray-900/50 border-gray-700/50 opacity-75'
                                            : 'bg-deepspace-900/60 border-neon-cyan/30 hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                                    }
                `}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-neon-cyan/10 text-neon-cyan'}`}>
                                        {getTechIcon(tech.icon)}
                                    </div>
                                    {isCompleted ? (
                                        <div className="flex items-center gap-1 text-green-400 font-bold font-rajdhani text-sm bg-green-900/30 px-2 py-1 rounded">
                                            <Check className="w-4 h-4" />
                                            RESEARCHED
                                        </div>
                                    ) : isLocked ? (
                                        <div className="flex items-center gap-1 text-gray-500 font-bold font-rajdhani text-sm bg-gray-800/50 px-2 py-1 rounded">
                                            <Lock className="w-4 h-4" />
                                            LOCKED
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-neon-cyan font-bold font-rajdhani text-sm bg-neon-cyan/10 px-2 py-1 rounded animate-pulse">
                                            AVAILABLE
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <h3 className="font-orbitron text-xl font-bold text-white mb-2">
                                    {tech.name}
                                </h3>
                                <p className="font-rajdhani text-sm text-gray-400 mb-4 h-10">
                                    {tech.description}
                                </p>

                                {/* Cost */}
                                {!isCompleted && (
                                    <div className="mb-4 p-3 bg-deepspace-950/50 rounded-lg border border-gray-700/30">
                                        <div className="text-xs text-gray-500 mb-2 font-rajdhani uppercase tracking-wider">Research Cost</div>
                                        <div className="flex flex-wrap gap-3 text-sm font-rajdhani">
                                            {tech.cost.metal > 0 && (
                                                <span className={(user?.resources.metal || 0) >= tech.cost.metal ? 'text-gray-300' : 'text-red-400'}>
                                                    {tech.cost.metal} Metal
                                                </span>
                                            )}
                                            {tech.cost.crystal > 0 && (
                                                <span className={(user?.resources.crystal || 0) >= tech.cost.crystal ? 'text-gray-300' : 'text-red-400'}>
                                                    {tech.cost.crystal} Crystal
                                                </span>
                                            )}
                                            {tech.cost.energy > 0 && (
                                                <span className={(user?.resources.energy || 0) >= tech.cost.energy ? 'text-gray-300' : 'text-red-400'}>
                                                    {tech.cost.energy} Energy
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                {!isCompleted && (
                                    <button
                                        onClick={() => handleResearch(tech.id)}
                                        disabled={isLocked || !affordable || isResearching}
                                        className={`
                      w-full py-3 rounded-lg font-orbitron font-bold text-sm transition-all duration-300
                      ${isLocked
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : affordable
                                                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan hover:bg-neon-cyan/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                                                    : 'bg-red-500/10 text-red-400 border border-red-500/30 cursor-not-allowed'
                                            }
                    `}
                                    >
                                        {isResearching ? 'RESEARCHING...' : isLocked ? 'LOCKED' : affordable ? 'START RESEARCH' : 'INSUFFICIENT RESOURCES'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Research;
