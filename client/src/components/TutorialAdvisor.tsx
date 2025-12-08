import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gameService from '../services/gameService';
import { TUTORIAL_QUESTS, type Quest } from '../config/gameData';
import { Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TutorialAdvisor = () => {
    const { user } = useAuth(); // We might need to update user context
    const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [minimized, setMinimized] = useState(false);

    useEffect(() => {
        if (user) {
            const index = user.currentQuestIndex || 0;
            if (index < TUTORIAL_QUESTS.length) {
                setCurrentQuest(TUTORIAL_QUESTS[index]);
                setIsCompleted(false);
            } else {
                setIsCompleted(true);
                setCurrentQuest(null);
            }
        }
    }, [user]);

    const handleClaim = async () => {
        if (!currentQuest) return;
        setLoading(true);
        try {
            const response = await gameService.claimQuest();
            if (response.success) {
                toast.success(response.message, { icon: '🎓' });
                // Update local user state if possible, or force reload
                // Ideally, AuthContext should have a refreshUser method
                // For now, we can rely on the response user data if we could update context
                // Or just reload page
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message || 'Requirements not met yet.');
        } finally {
            setLoading(false);
        }
    };

    if (isCompleted && minimized) return null;

    if (isCompleted) {
        return (
            <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
                <div className="bg-deepspace-900/90 backdrop-blur-md border border-neon-cyan/50 rounded-xl p-4 shadow-[0_0_20px_rgba(0,240,255,0.2)] max-w-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan">
                                <Sparkles className="w-4 h-4 text-neon-cyan" />
                            </div>
                            <h3 className="font-orbitron font-bold text-white">NEXUS AI</h3>
                        </div>
                        <button onClick={() => setMinimized(true)} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    <p className="text-sm font-rajdhani text-gray-300">
                        Academy training complete, Commander. You are cleared for independent operations. Good luck out there.
                    </p>
                </div>
            </div>
        );
    }

    if (!currentQuest) return null;

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${minimized ? 'translate-y-[calc(100%-3rem)]' : ''}`}>
            <div className="bg-deepspace-900/95 backdrop-blur-md border-2 border-neon-magenta/50 rounded-xl shadow-[0_0_30px_rgba(255,0,255,0.15)] max-w-sm overflow-hidden">
                {/* Header */}
                <div
                    className="bg-gradient-to-r from-deepspace-950 to-deepspace-900 p-3 flex justify-between items-center cursor-pointer border-b border-gray-800"
                    onClick={() => setMinimized(!minimized)}
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-neon-magenta/20 flex items-center justify-center border border-neon-magenta">
                                <div className="w-2 h-2 bg-neon-magenta rounded-full animate-ping absolute"></div>
                                <div className="w-2 h-2 bg-neon-magenta rounded-full relative z-10"></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-orbitron font-bold text-white text-sm">NEXUS ADVISOR</h3>
                            <div className="text-[10px] font-mono text-neon-magenta uppercase tracking-wider">
                                Quest {((user?.currentQuestIndex || 0) + 1)} / {TUTORIAL_QUESTS.length}
                            </div>
                        </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${minimized ? '-rotate-90' : 'rotate-90'}`} />
                </div>

                {/* Content */}
                {!minimized && (
                    <div className="p-4">
                        <h4 className="font-orbitron font-bold text-lg text-white mb-1">{currentQuest.title}</h4>
                        <p className="text-sm font-rajdhani text-gray-300 mb-4 leading-relaxed">
                            {currentQuest.description}
                        </p>

                        <div className="bg-black/40 rounded p-3 mb-4 border border-gray-800">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Objective</div>
                            <div className="flex items-center gap-2 text-sm text-white font-rajdhani">
                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                                <span>
                                    {currentQuest.type === 'BUILD' && `Construct: ${currentQuest.target.replace('_', ' ')}`}
                                    {currentQuest.type === 'CRAFT' && `Craft: ${currentQuest.target.replace('_', ' ')}`}
                                    {currentQuest.type === 'RESEARCH' && `Research: ${currentQuest.target.replace(/_/g, ' ')}`}
                                    {currentQuest.type === 'COMBAT_WIN' && `Defeat: ${currentQuest.target.replace(/_/g, ' ')}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                                <span className="block text-gray-600 uppercase text-[10px]">Reward</span>
                                <span className="text-neon-cyan">
                                    {currentQuest.reward.metal && `+${currentQuest.reward.metal} Metal `}
                                    {currentQuest.reward.credits && `+${currentQuest.reward.credits} Credits `}
                                    {currentQuest.reward.itemId && `+Item `}
                                </span>
                            </div>
                            <button
                                onClick={handleClaim}
                                disabled={loading}
                                className="px-4 py-2 bg-neon-magenta hover:bg-neon-magenta/80 text-white text-xs font-bold font-orbitron rounded flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(255,0,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'CLAIM REWARD'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorialAdvisor;
