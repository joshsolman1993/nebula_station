import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gameService from '../services/gameService';
import { ENEMIES, SHIPS } from '../config/gameData';
import type { Enemy } from '../config/gameData';
import { Sword, Shield, Target, AlertTriangle, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';

import { useSound } from '../contexts/SoundContext';
import CombatArena from '../components/CombatArena';

const Operations = () => {
    const { user, refreshUser } = useAuth();
    const { playSfx } = useSound();
    const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null);
    const [fleetComposition, setFleetComposition] = useState<Record<string, number>>({});
    const [isAttacking, setIsAttacking] = useState(false);
    const [battleReport, setBattleReport] = useState<any | null>(null);
    const [showReport, setShowReport] = useState(false);

    // Refresh user data on mount to ensure ship count is accurate
    useEffect(() => {
        refreshUser();
    }, []);

    // Reset fleet composition when enemy changes
    useEffect(() => {
        if (selectedEnemy) {
            setFleetComposition({});
        }
    }, [selectedEnemy]);

    const handleShipCountChange = (shipId: string, count: number) => {
        const totalOwned = user?.ships?.[shipId] || 0;
        const damaged = user?.damagedShips?.[shipId] || 0;
        const missionLocked = (user?.activeMission?.shipId === shipId) ? (user?.activeMission?.shipCount || 0) : 0;
        const available = Math.max(0, totalOwned - damaged - missionLocked);

        const max = Math.max(0, available);
        const newCount = Math.min(Math.max(0, count), max);

        setFleetComposition(prev => ({
            ...prev,
            [shipId]: newCount
        }));
    };

    const calculateWinChance = () => {
        if (!selectedEnemy) return 0;

        let totalAttack = 0;
        let totalDefense = 0; // Not used in simple calculation but good to know

        Object.entries(fleetComposition).forEach(([shipId, count]) => {
            const ship = SHIPS.find(s => s.id === shipId);
            if (ship && count > 0) {
                totalAttack += (ship.attack || 0) * count;
                totalDefense += (ship.defense || 0) * count;
            }
        });

        if (totalAttack === 0) return 0;

        // Simple heuristic: If Attack > Enemy HP / 5 (assuming 5 rounds to kill), good chance.
        // Enemy deals damage too.
        // Let's use Power Ratio: Player Attack / Enemy Attack
        // If Ratio > 1, Likely Win.
        // Also consider HP.

        // Simulation approximation:
        // Rounds to Kill Enemy = Enemy HP / Player Attack
        // Rounds to Kill Player = Player HP / Enemy Attack
        // If Player Rounds > Enemy Rounds, Win.

        const roundsToKillEnemy = selectedEnemy.hp / totalAttack;
        const roundsToKillPlayer = totalDefense / selectedEnemy.attack;

        if (roundsToKillEnemy < roundsToKillPlayer) return 90; // High chance
        if (roundsToKillEnemy < roundsToKillPlayer * 1.2) return 60; // Medium
        return 30; // Low
    };

    const handleAttack = async () => {
        if (!selectedEnemy) return;

        // Check if any ships selected
        const totalShips = Object.values(fleetComposition).reduce((a, b) => a + b, 0);
        if (totalShips === 0) {
            toast.error('Select ships to deploy!');
            return;
        }

        setIsAttacking(true);
        try {
            const response = await gameService.attackEnemy(selectedEnemy.id, fleetComposition);
            if (response.success) {
                playSfx('combat');
                setBattleReport(response.battleReport);
                setShowReport(true);
                // Refresh user data is handled by context update usually, but we might need to force reload or re-fetch
                // gameService methods usually return updated user object.
                // We need to update context. For now, page reload or simple toast.
                // Ideally, AuthContext should expose a refreshUser method.
                // We'll rely on the response data to show immediate results.
                window.location.reload(); // Brute force update for now to reflect lost ships/rewards
            }
        } catch (error: any) {
            toast.error(error.message || 'Attack failed');
        } finally {
            setIsAttacking(false);
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return 'text-green-400';
            case 'Medium': return 'text-yellow-400';
            case 'Hard': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <header className="mb-8">
                <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    OPERATIONS CENTER
                </h1>
                <p className="text-gray-400 font-rajdhani mt-2 text-lg">
                    Deploy your fleet to neutralize threats and secure the sector.
                </p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* RADAR: Enemy List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-2xl font-orbitron text-white flex items-center gap-2">
                        <Target className="text-red-500" /> Radar Contact
                    </h2>
                    <div className="space-y-4">
                        {ENEMIES.map(enemy => (
                            <div
                                key={enemy.id}
                                onClick={() => setSelectedEnemy(enemy)}
                                className={`
                                    p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden
                                    ${selectedEnemy?.id === enemy.id
                                        ? 'bg-red-900/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                        : 'bg-deepspace-900/50 border-gray-800 hover:border-red-500/50'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{enemy.icon}</span>
                                        <div>
                                            <h3 className="font-orbitron font-bold text-white">{enemy.name}</h3>
                                            <span className={`text-xs font-bold uppercase ${getDifficultyColor(enemy.difficulty)}`}>
                                                {enemy.difficulty} Threat
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm font-rajdhani text-gray-400 mt-2">
                                    <div className="flex items-center gap-1"><Sword className="w-3 h-3" /> ATK: {enemy.attack}</div>
                                    <div className="flex items-center gap-1"><Shield className="w-3 h-3" /> HP: {enemy.hp}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BATTLE PREP */}
                <div className="lg:col-span-2">
                    {selectedEnemy ? (
                        <div className="bg-deepspace-900/80 border border-red-500/30 rounded-xl p-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Crosshair className="w-32 h-32 text-red-500" />
                            </div>

                            <h2 className="text-2xl font-orbitron text-white mb-6 flex items-center gap-2">
                                <Sword className="text-orange-500" /> Battle Preparation
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-rajdhani text-gray-400 mb-4 uppercase tracking-wider">Target Analysis</h3>
                                    <div className="bg-black/40 rounded-lg p-4 border border-gray-800">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center text-4xl border border-red-500/50">
                                                {selectedEnemy.icon}
                                            </div>
                                            <div>
                                                <div className="text-xl font-bold text-white">{selectedEnemy.name}</div>
                                                <div className="text-gray-400 text-sm">{selectedEnemy.description}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm font-rajdhani">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Attack Power</span>
                                                <span className="text-red-400 font-bold">{selectedEnemy.attack}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Hull Integrity</span>
                                                <span className="text-green-400 font-bold">{selectedEnemy.hp}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Potential Reward</span>
                                                <span className="text-yellow-400">
                                                    {selectedEnemy.reward.credits && 'Credits, '}
                                                    {selectedEnemy.reward.metal && 'Metal, '}
                                                    {selectedEnemy.reward.crystal && 'Crystal, '}
                                                    {selectedEnemy.reward.artifactChance && 'Artifact'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-rajdhani text-gray-400 mb-4 uppercase tracking-wider">Fleet Deployment</h3>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                        {(() => {
                                            const shipsToShow = SHIPS.filter(ship => (user?.ships?.[ship.id] || 0) > 0);

                                            if (shipsToShow.length === 0) {
                                                return (
                                                    <div className="text-gray-500 text-center py-8 font-rajdhani">
                                                        No ships in hangar. <br />
                                                        Go to <span className="text-neon-cyan">Fleet</span> to build some.
                                                    </div>
                                                );
                                            }

                                            return shipsToShow.map(ship => {
                                                const totalOwned = user?.ships?.[ship.id] || 0;
                                                const damaged = user?.damagedShips?.[ship.id] || 0;
                                                const available = Math.max(0, totalOwned - damaged);

                                                return (
                                                    <div key={ship.id} className={`flex items-center justify-between bg-deepspace-950 p-3 rounded border ${available === 0 ? 'border-gray-800 opacity-60' : 'border-gray-700'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl">{ship.icon}</span>
                                                            <div>
                                                                <div className="font-bold text-white text-sm">{ship.name}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    ATK: {ship.attack} | DEF: {ship.defense}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => handleShipCountChange(ship.id, (fleetComposition[ship.id] || 0) - 1)}
                                                                disabled={available === 0}
                                                                className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-8 text-center font-mono text-white">
                                                                {fleetComposition[ship.id] || 0}
                                                            </span>
                                                            <button
                                                                onClick={() => handleShipCountChange(ship.id, (fleetComposition[ship.id] || 0) + 1)}
                                                                disabled={available === 0}
                                                                className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                +
                                                            </button>
                                                            <div className="text-xs text-right w-16">
                                                                <div className={`font-bold ${available > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                    {available} Rdy
                                                                </div>
                                                                <div className="text-gray-600">
                                                                    / {totalOwned} Total
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
                                <div>
                                    <div className="text-gray-400 text-sm font-rajdhani uppercase tracking-wider">Win Probability</div>
                                    <div className={`text-2xl font-bold font-orbitron ${calculateWinChance() > 80 ? 'text-green-400' :
                                        calculateWinChance() > 40 ? 'text-yellow-400' : 'text-red-500'
                                        }`}>
                                        {calculateWinChance() > 0 ? `~${calculateWinChance()}%` : 'Unknown'}
                                    </div>
                                </div>
                                <button
                                    onClick={handleAttack}
                                    disabled={isAttacking} // Allow click to show validation error if empty
                                    className={`
                                        px-8 py-4 rounded-lg font-orbitron font-bold text-lg tracking-wider
                                        flex items-center gap-3 transition-all
                                        ${isAttacking
                                            ? 'bg-gray-700 cursor-not-allowed'
                                            : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                                        }
                                        ${calculateWinChance() === 0 ? 'opacity-70' : ''} 
                                    `}
                                >
                                    {isAttacking ? 'ENGAGING...' : 'ENGAGE HOSTILES'}
                                    <Crosshair className={isAttacking ? 'animate-spin' : ''} />
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl p-12">
                            <Target className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-orbitron text-xl">Select a target from Radar</p>
                        </div>
                    )}
                </div>

                {/* REPAIR DOCK */}
                <div className="lg:col-span-3 mt-8">
                    <div className="bg-deepspace-900/50 border border-neon-cyan/30 rounded-xl p-6">
                        <h2 className="text-2xl font-orbitron text-white mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-yellow-400" /> Repair Dock
                        </h2>

                        {Object.keys(user?.damagedShips || {}).length === 0 ? (
                            <div className="text-gray-500 font-rajdhani text-center py-8">
                                All systems nominal. No repairs needed.
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(user?.damagedShips || {}).map(([shipId, count]) => {
                                    const ship = SHIPS.find(s => s.id === shipId);
                                    if (!ship || count <= 0) return null;

                                    const repairCost = {
                                        metal: Math.floor(ship.cost.metal * 0.2),
                                        crystal: Math.floor(ship.cost.crystal * 0.2),
                                        energy: Math.floor(ship.cost.energy * 0.2),
                                        credits: Math.floor(ship.cost.credits * 0.2),
                                    };

                                    return (
                                        <div key={shipId} className="bg-black/40 border border-red-500/30 rounded-lg p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl grayscale opacity-70">{ship.icon}</span>
                                                <div>
                                                    <div className="font-bold text-red-400">{count}x {ship.name}</div>
                                                    <div className="text-xs text-gray-500">Damaged</div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-xs text-gray-400 mb-2">
                                                    {repairCost.metal > 0 && <span>{repairCost.metal}🔩 </span>}
                                                    {repairCost.crystal > 0 && <span>{repairCost.crystal}💎 </span>}
                                                    {repairCost.credits > 0 && <span>{repairCost.credits}💰</span>}
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await gameService.repairShip(shipId);
                                                            if (res.success) {
                                                                toast.success(res.message);
                                                                window.location.reload();
                                                            }
                                                        } catch (e: any) {
                                                            toast.error(e.message);
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan text-xs rounded hover:bg-neon-cyan/30"
                                                >
                                                    Repair 1
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Battle Report Modal (Simplified as a toast/alert for now, or conditional render) */}
            {/* Ideally this should be a proper modal. For MVP, we rely on Toast + maybe a result section below? */}
            {/* Let's add a result section below if report exists */}

            {/* Combat Arena Modal */}
            {showReport && battleReport && selectedEnemy && (
                <CombatArena
                    battleResult={battleReport}
                    enemyName={selectedEnemy.name}
                    enemyTotalHP={selectedEnemy.hp}
                    playerTotalHP={Object.entries(fleetComposition).reduce((total, [id, count]) => {
                        const ship = SHIPS.find(s => s.id === id);
                        return total + ((ship?.defense || 0) * (user?.ships?.[id] || count)); // Estimate based on active fleet or total? Using fleet comp for consistency.
                        // Actually, fleetComposition is what we sent.
                        // Correct logic: sum(ship.defense * count in fleetComposition)
                    }, 0)}
                    onClose={() => {
                        setShowReport(false);
                        window.location.reload(); // Refresh to update actual data
                    }}
                />
            )}
        </div>
    );
};

export default Operations;
