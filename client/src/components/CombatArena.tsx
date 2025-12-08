import { useRef, useEffect, useState } from 'react';
import { useSound } from '../contexts/SoundContext';
import { Skull, Crosshair, Shield, Award, AlertTriangle, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleLogEntry {
    type: string;
    message: string;
    data?: any;
    source?: 'player' | 'enemy';
    target?: 'player' | 'enemy';
    amount?: number;
}

interface CombatArenaProps {
    battleResult: {
        winner: 'player' | 'enemy';
        log: BattleLogEntry[];
        rewards?: any;
        losses?: any;
    };
    enemyName: string;
    enemyTotalHP: number; // Max HP
    playerTotalHP: number; // Max HP (Estimated or passed)
    onClose: () => void;
}

const CombatArena: React.FC<CombatArenaProps> = ({
    battleResult,
    enemyName,
    enemyTotalHP,
    playerTotalHP,
    onClose
}) => {
    // Suppress unused warning
    const _ = enemyName;
    const { playSfx } = useSound();

    // Playback State
    const [currentLogIndex, setCurrentLogIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [playbackSpeed] = useState(1500); // ms per turn

    // Visual State
    const [enemyCurrentHP, setEnemyCurrentHP] = useState(enemyTotalHP);
    const [playerCurrentHP, setPlayerCurrentHP] = useState(playerTotalHP);
    const [floatingTexts, setFloatingTexts] = useState<{ id: number, text: string, type: 'damage' | 'heal' | 'info' | 'crit', x: number, y: number }[]>([]);

    const [attacker, setAttacker] = useState<'player' | 'enemy' | null>(null);
    const [laserBeam, setLaserBeam] = useState<boolean>(false);
    const [shake, setShake] = useState(false);

    const logEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentLogIndex]);

    // Playback Loop
    useEffect(() => {
        if (isFinished) return;

        const timer = setTimeout(() => {
            if (currentLogIndex >= battleResult.log.length) {
                setIsFinished(true);
                playSfx(battleResult.winner === 'player' ? 'level_up' : 'game_over'); // Placeholder sounds
                return;
            }

            const entry = battleResult.log[currentLogIndex];
            processEntry(entry);
            setCurrentLogIndex(prev => prev + 1);

        }, playbackSpeed);

        return () => clearTimeout(timer);
    }, [currentLogIndex, isFinished, playbackSpeed, battleResult]);

    const processEntry = (entry: BattleLogEntry) => {
        // 1. Reset transient effects
        setAttacker(null);
        setLaserBeam(false);
        setShake(false);

        // 2. Handle Entry Types
        switch (entry.type) {
            case 'damage':
                handleDamage(entry);
                break;
            case 'battle_start':
            case 'round_start':
                // Maybe a small round indicator flash?
                break;
            case 'victory':
            case 'defeat':
                // handled by isFinished state eventually, but can play sound here
                break;
            case 'destruction':
                addFloatingText(entry.message, 'crit', 20, 50); // Left side
                playSfx('explosion'); // Need to ensure this sound exists or map to generic
                setShake(true);
                break;
            case 'loot':
                playSfx('success');
                break;
        }
    };

    const handleDamage = (entry: BattleLogEntry) => {
        const isPlayerAttacking = entry.source === 'player';
        setAttacker(isPlayerAttacking ? 'player' : 'enemy');
        setLaserBeam(true);
        playSfx('laser'); // Generic laser

        const amount = entry.amount || 0;

        // Add Floating Text
        // If player attacks, text appears on Enemy (Right: 80%), else on Player (Left: 20%)
        addFloatingText(`-${amount}`, 'damage', isPlayerAttacking ? 80 : 20, 40);

        // Update HP Bars
        if (isPlayerAttacking) {
            setEnemyCurrentHP(prev => Math.max(0, prev - amount));
        } else {
            setPlayerCurrentHP(prev => Math.max(0, prev - amount));
            setShake(true); // Screen shake on player hit
        }
    };

    const addFloatingText = (text: string, type: 'damage' | 'heal' | 'info' | 'crit', x: number, y: number) => {
        const id = Date.now();
        setFloatingTexts(prev => [...prev, { id, text, type, x, y }]);
        // Cleanup after animation
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
        }, 1000);
    };

    const skipAnimation = () => {
        // Calculate final state immediately
        // Wait, logic is complex to re-calc HP. 
        // Simpler: Just set Index to end, but visual Bars won't update strictly unless we re-run logic or just rely on 'victory' state display.
        // Let's just set isFinished true and show results screen, ignoring intermediate visual state.
        setIsFinished(true);
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-colors duration-100 ${shake ? 'translate-x-[2px] translate-y-[2px]' : ''}`}>

            {/* Main Arena Container */}
            <div className="relative w-full max-w-5xl h-[600px] bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">

                {/* Header */}
                <div className="h-16 bg-slate-950 flex items-center justify-between px-6 border-b border-slate-800">
                    <h2 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                        <Crosshair className="text-red-500" /> TACTICAL DISPLAY
                    </h2>
                    {!isFinished && (
                        <button onClick={skipAnimation} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <FastForward size={20} /> SKIP
                        </button>
                    )}
                </div>

                {/* Battle Area */}
                <div className="flex-1 relative bg-[url('/grid_bg.png')] bg-cover">
                    {/* Player Side (Left) */}
                    <div className="absolute left-10 top-1/3 flex flex-col items-center gap-4 transition-transform duration-300">
                        <div className={`relative w-32 h-32 rounded-full border-4 ${attacker === 'player' ? 'border-neon-cyan shadow-[0_0_30px_#00f0ff]' : 'border-slate-600'} bg-slate-800 flex items-center justify-center p-4`}>
                            <Shield className="w-16 h-16 text-blue-400" />
                        </div>
                        <div className="w-48">
                            <div className="flex justify-between text-xs text-blue-300 mb-1">
                                <span>FLEET INTEGRITY</span>
                                <span>{playerCurrentHP}/{playerTotalHP}</span>
                            </div>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                                    style={{ width: `${(playerCurrentHP / playerTotalHP) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Enemy Side (Right) */}
                    <div className="absolute right-10 top-1/3 flex flex-col items-center gap-4">
                        <div className={`relative w-32 h-32 rounded-full border-4 ${attacker === 'enemy' ? 'border-red-500 shadow-[0_0_30px_#ef4444]' : 'border-slate-600'} bg-slate-800 flex items-center justify-center p-4`}>
                            <Skull className="w-16 h-16 text-red-500" />
                        </div>
                        <div className="w-48">
                            <div className="flex justify-between text-xs text-red-300 mb-1">
                                <span>HOSTILE SIGNAL</span>
                                <span>{enemyCurrentHP}/{enemyTotalHP}</span>
                            </div>
                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <div
                                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500"
                                    style={{ width: `${(enemyCurrentHP / enemyTotalHP) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Attack Animation (Laser) */}
                    <AnimatePresence>
                        {laserBeam && attacker && (
                            <motion.div
                                initial={{ opacity: 0, scaleX: 0 }}
                                animate={{ opacity: 1, scaleX: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`absolute top-[45%] left-[20%] right-[20%] h-2 bg-gradient-to-r ${attacker === 'player' ? 'from-cyan-400 to-transparent origin-left' : 'from-transparent to-red-500 origin-right'}`}
                                style={{
                                    transformOrigin: attacker === 'player' ? 'left' : 'right'
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Floating Texts */}
                    <AnimatePresence>
                        {floatingTexts.map(ft => (
                            <motion.div
                                key={ft.id}
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -50, scale: 1.2 }}
                                exit={{ opacity: 0 }}
                                className={`absolute font-orbitron font-bold text-4xl shadow-black drop-shadow-lg 
                                    ${ft.type === 'damage' ? 'text-red-500' : 'text-yellow-400'}
                                `}
                                style={{ left: `${ft.x}%`, top: '40%' }}
                            >
                                {ft.text}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Log Console */}
                <div className="h-32 bg-black/50 border-t border-slate-800 p-4 font-mono text-sm overflow-y-auto">
                    {battleResult.log.slice(0, currentLogIndex + 1).map((entry, idx) => (
                        <div key={idx} className={`mb-1 ${entry.source === 'enemy' ? 'text-red-400' : 'text-cyan-400'}`}>
                            <span className="opacity-50 text-xs mr-2">[{idx + 1}]</span>
                            {entry.message}
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>

                {/* Victory/Defeat Overlay */}
                {isFinished && (
                    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-500 z-50">
                        {battleResult.winner === 'player' ? (
                            <>
                                <Award className="w-24 h-24 text-yellow-400 mb-4 animate-bounce" />
                                <h1 className="text-5xl font-orbitron font-bold text-yellow-400 mb-2">VICTORY</h1>
                                <p className="text-slate-400 mb-8">Enemy fleet neutralized.</p>

                                <div className="bg-slate-800/50 p-6 rounded-xl border border-yellow-400/30 min-w-[300px]">
                                    <h3 className="text-yellow-300 font-bold mb-4 border-b border-slate-700 pb-2">REWARDS ACQUIRED</h3>
                                    {battleResult.rewards.metal > 0 && <div className="flex justify-between text-gray-300"><span>Metal:</span> <span className="text-white">+{battleResult.rewards.metal}</span></div>}
                                    {battleResult.rewards.crystal > 0 && <div className="flex justify-between text-gray-300"><span>Crystal:</span> <span className="text-white">+{battleResult.rewards.crystal}</span></div>}
                                    {battleResult.rewards.credits > 0 && <div className="flex justify-between text-gray-300"><span>Credits:</span> <span className="text-green-400">+{battleResult.rewards.credits}</span></div>}
                                    {battleResult.rewards.artifact && <div className="mt-2 text-purple-400 font-bold flex items-center gap-2"><div className="w-2 h-2 bg-purple-500 rounded-full"></div>{battleResult.rewards.artifact.name}</div>}
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-24 h-24 text-red-500 mb-4 animate-pulse" />
                                <h1 className="text-5xl font-orbitron font-bold text-red-500 mb-2">DEFEAT</h1>
                                <p className="text-slate-400 mb-8">Fleet forced to retreat.</p>
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                        >
                            RETURN TO BASE
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CombatArena;
