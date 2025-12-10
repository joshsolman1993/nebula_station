import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const EventManager: React.FC = () => {
    const [difficulty, setDifficulty] = useState(1);
    const [activeQuest, setActiveQuest] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // New Quest Form
    const [questTitle, setQuestTitle] = useState('');
    const [questDescription, setQuestDescription] = useState('');
    const [questTarget, setQuestTarget] = useState(1000);
    const [questResource, setQuestResource] = useState('metal');

    useEffect(() => {
        fetchActiveQuest();
    }, []);

    const fetchActiveQuest = async () => {
        try {
            const response = await adminService.getActiveGlobalQuest();
            if (response.success) {
                setActiveQuest(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch quest');
        }
    };

    const handleTriggerInvasion = async () => {
        if (!window.confirm(`Trigger Invasion? This will spawn enemy presences in random sectors.`)) return;
        setLoading(true);
        try {
            const response = await adminService.triggerInvasion(difficulty);
            if (response.success) {
                toast.success(response.message || 'Invasion triggered successfully');
            }
        } catch (error) {
            toast.error('Failed to trigger invasion');
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.createGlobalQuest({
                type: 'DONATION',
                title: questTitle,
                description: questDescription,
                targetAmount: questTarget,
                targetResource: questResource,
                durationHours: 24
            });
            toast.success('Global Quest Started!');
            setQuestTitle('');
            await fetchActiveQuest();
        } catch (error) {
            toast.error('Failed to start quest');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuest = async (status: string) => {
        if (!activeQuest) return;
        try {
            await adminService.updateGlobalQuest(activeQuest._id, { status });
            toast.success(`Quest marked as ${status}`);
            fetchActiveQuest();
        } catch (error) {
            toast.error('Failed to update quest');
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* INVASION CONTROL */}
            <div className="bg-red-900/10 border border-red-600/30 p-6 rounded backdrop-blur-sm">
                <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                    <span>⚠️ INVASION PROTOCOL</span>
                </h2>
                <p className="text-gray-400 mb-6 text-sm">
                    Triggering an invasion will cause enemy fleets to appear in random sectors, increasing danger levels but providing combat opportunities.
                </p>

                <div className="flex items-center gap-4 mb-4">
                    <label className="text-gray-300">Danger Level:</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={difficulty}
                        onChange={(e) => setDifficulty(Number(e.target.value))}
                        className="flex-1 accent-red-500"
                    />
                    <span className="text-xl font-mono text-red-400 font-bold">{difficulty}</span>
                </div>

                <button
                    onClick={handleTriggerInvasion}
                    disabled={loading}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-black font-bold uppercase tracking-widest rounded transition-all flex justify-center items-center gap-2"
                >
                    {loading ? 'INITIALIZING...' : '🚀 LAUNCH INVASION'}
                </button>
            </div>

            {/* GLOBAL QUEST */}
            <div className="bg-blue-900/10 border border-blue-600/30 p-6 rounded backdrop-blur-sm">
                <h2 className="text-xl font-bold text-blue-500 mb-4 flex items-center gap-2">
                    <span>🌍 GLOBAL QUEST</span>
                </h2>

                {activeQuest ? (
                    <div className="space-y-4">
                        <div className="bg-black/40 p-4 rounded border border-blue-500/20">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white text-lg">{activeQuest.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded ${activeQuest.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                    activeQuest.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {activeQuest.status}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">{activeQuest.description}</p>

                            <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden mb-2">
                                <div
                                    className="bg-blue-500 h-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (activeQuest.currentAmount / activeQuest.targetAmount) * 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs font-mono text-gray-500">
                                <span>{activeQuest.currentAmount} / {activeQuest.targetAmount} {activeQuest.targetResource}</span>
                                <span>{(activeQuest.currentAmount / activeQuest.targetAmount * 100).toFixed(1)}%</span>
                            </div>
                        </div>

                        {activeQuest.status === 'ACTIVE' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdateQuest('COMPLETED')}
                                    className="flex-1 py-2 bg-green-900/30 border border-green-700 text-green-400 hover:bg-green-900/50 rounded text-sm"
                                >
                                    Force Complete
                                </button>
                                <button
                                    onClick={() => handleUpdateQuest('FAILED')}
                                    className="flex-1 py-2 bg-red-900/30 border border-red-700 text-red-400 hover:bg-red-900/50 rounded text-sm"
                                >
                                    Force Fail
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleStartQuest} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Quest Title"
                            className="w-full bg-black border border-gray-700 p-2 rounded text-white text-sm"
                            value={questTitle}
                            onChange={e => setQuestTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            className="w-full bg-black border border-gray-700 p-2 rounded text-white text-sm h-20"
                            value={questDescription}
                            onChange={e => setQuestDescription(e.target.value)}
                            required
                        />
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Target Amount"
                                className="flex-1 bg-black border border-gray-700 p-2 rounded text-white text-sm"
                                value={questTarget}
                                onChange={e => setQuestTarget(Number(e.target.value))}
                                required
                            />
                            <select
                                className="flex-1 bg-black border border-gray-700 p-2 rounded text-white text-sm"
                                value={questResource}
                                onChange={e => setQuestResource(e.target.value)}
                            >
                                <option value="metal">Metal</option>
                                <option value="crystal">Crystal</option>
                                <option value="energy">Energy</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
                        >
                            Start New Quest
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EventManager;
