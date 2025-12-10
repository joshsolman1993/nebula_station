import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Flag, ArrowRight } from 'lucide-react';

interface EventBannerProps {
    events: {
        quest: {
            title: string;
            description: string;
            currentAmount: number;
            targetAmount: number;
            targetResource: string;
            status: string;
        } | null;
        invasionActive: boolean;
        invasionSectorCount: number;
    };
}

const EventBanner: React.FC<EventBannerProps> = ({ events }) => {
    const navigate = useNavigate();
    const { quest, invasionActive, invasionSectorCount } = events;

    if (!quest && !invasionActive) return null;

    return (
        <div className="flex flex-col gap-4 mb-6">
            {/* INVASION BANNER */}
            {invasionActive && (
                <div className="bg-red-950/80 border border-red-600 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse-slow relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-600/10 animate-pulse"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-red-600 p-3 rounded-full animate-bounce">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-orbitron font-bold text-red-500 uppercase tracking-widest">
                                Invasion Warning
                            </h3>
                            <p className="text-red-200 font-rajdhani">
                                Enemy signals detected in <span className="font-bold text-white">{invasionSectorCount}</span> sectors!
                                Immediate defense required.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/galaxy')}
                        className="relative z-10 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded uppercase tracking-wider transition-all flex items-center gap-2"
                    >
                        <span>Defend Grid</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* GLOBAL QUEST BANNER */}
            {quest && quest.status === 'ACTIVE' && (
                <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 border border-blue-500/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden backdrop-blur-md">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="bg-blue-600/30 p-3 rounded-full">
                            <Flag className="w-6 h-6 text-blue-300" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-lg font-orbitron font-bold text-blue-300 uppercase">
                                    Global Quest: <span className="text-white">{quest.title}</span>
                                </h3>
                                <span className="text-xs text-blue-200 font-mono">
                                    {(quest.currentAmount / quest.targetAmount * 100).toFixed(1)}% Complete
                                </span>
                            </div>
                            <p className="text-blue-200/80 text-sm mb-2 font-rajdhani">{quest.description}</p>

                            {/* Progress Bar */}
                            <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden border border-blue-500/20">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 relative"
                                    style={{ width: `${Math.min(100, (quest.currentAmount / quest.targetAmount) * 100)}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(quest.targetResource === 'metal' || quest.targetResource === 'crystal' || quest.targetResource === 'energy') && (
                        <button
                            className="px-6 py-2 bg-blue-600/20 border border-blue-500 hover:bg-blue-600/40 text-blue-300 font-bold rounded uppercase tracking-wider transition-all whitespace-nowrap"
                            // For now, this button might just take them to a resource contribution modal or page.
                            // Since we didn't spec a "Contribute" UI yet, let's perhaps disable it or make it just informational for now?
                            // Or simpler: "View Leaderboard" or something.
                            // Let's make it alert "Coming Soon" or navigate to where they can contribute if implemented.
                            onClick={() => alert("Contribution feature coming in next phase!")}
                        >
                            Contribute
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventBanner;
