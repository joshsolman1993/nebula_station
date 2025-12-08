import { useState, useEffect } from 'react';
import { SHIPS, MISSIONS, type Ship } from '../config/gameData';
import fleetService from '../services/fleetService';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

interface FleetOperationsProps {
    userResources: {
        metal: number;
        crystal: number;
        energy: number;
    };
    userCredits: number;
    userShips: Record<string, number>;
    activeMission: any;
    onUpdate: () => void;
    completedResearch: string[];
    damagedShips?: Record<string, number>;
}

const FleetOperations = ({
    userResources,
    userCredits,
    userShips,
    activeMission,
    onUpdate,
    completedResearch,
    damagedShips = {},
}: FleetOperationsProps) => {
    const [isCrafting, setIsCrafting] = useState(false);
    const [isLaunching, setIsLaunching] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    // Mission launch form
    const [selectedMission, setSelectedMission] = useState<string | null>(null);
    const [selectedShip, setSelectedShip] = useState<string>('scout_drone');
    const [shipCount, setShipCount] = useState(1);

    // Countdown timer
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [missionComplete, setMissionComplete] = useState(false);

    // Update countdown timer
    useEffect(() => {
        if (!activeMission) {
            setTimeRemaining(0);
            setMissionComplete(false);
            return;
        }

        const updateTimer = () => {
            const now = new Date().getTime();
            const endTime = new Date(activeMission.endTime).getTime();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

            setTimeRemaining(remaining);
            setMissionComplete(remaining === 0);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [activeMission]);

    const canAffordShip = (ship: Ship) => {
        return (
            userResources.metal >= ship.cost.metal &&
            userResources.crystal >= ship.cost.crystal &&
            userResources.energy >= ship.cost.energy &&
            userCredits >= ship.cost.credits
        );
    };

    const isUnlocked = (ship: Ship) => {
        if (!ship.requiredTech) return true;
        return completedResearch.includes(ship.requiredTech);
    };

    const handleCraftShip = async (shipId: string) => {
        setIsCrafting(true);

        try {
            const response = await fleetService.craftShip(shipId);
            if (response.success) {
                toast.success(response.message, { icon: '🚀' });
                onUpdate();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to craft ship');
        } finally {
            setIsCrafting(false);
        }
    };

    const handleLaunchMission = async () => {
        if (!selectedMission) return;

        setIsLaunching(true);

        try {
            const response = await fleetService.startMission(selectedMission, selectedShip, shipCount);
            if (response.success) {
                toast.success(response.message, { icon: '🎯' });
                onUpdate();
                setSelectedMission(null);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to launch mission');
        } finally {
            setIsLaunching(false);
        }
    };

    const handleClaimMission = async () => {
        setIsClaiming(true);

        try {
            const response = await fleetService.claimMission();
            if (response.success) {
                // Show reward popup
                const reward = response.reward;
                const rewardText = [];
                if (reward.metal > 0) rewardText.push(`+${reward.metal} Metal`);
                if (reward.crystal > 0) rewardText.push(`+${reward.crystal} Crystal`);
                if (reward.energy > 0) rewardText.push(`+${reward.energy} Energy`);

                toast.success(
                    <div>
                        <div className="font-bold">Mission Complete!</div>
                        <div className="text-sm">{rewardText.join(', ')}</div>
                    </div>,
                    {
                        icon: '✨',
                        duration: 5000,
                    }
                );

                // Show Artifact Drop Notification
                if (response.droppedArtifact) {
                    const artifact = response.droppedArtifact;
                    const rarityColors = {
                        common: 'text-gray-400',
                        rare: 'text-blue-400',
                        epic: 'text-purple-400',
                        legendary: 'text-yellow-400'
                    };
                    const colorClass = rarityColors[artifact.rarity as keyof typeof rarityColors] || 'text-white';

                    setTimeout(() => {
                        toast(
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">🎁</div>
                                <div>
                                    <div className={`font-bold font-orbitron ${colorClass} animate-pulse`}>
                                        ARTIFACT FOUND!
                                    </div>
                                    <div className="text-sm font-rajdhani text-white">
                                        {artifact.name}
                                    </div>
                                </div>
                            </div>,
                            {
                                duration: 6000,
                                style: {
                                    background: 'rgba(0, 0, 0, 0.9)',
                                    border: '1px solid rgba(0, 240, 255, 0.3)',
                                    color: '#fff',
                                },
                            }
                        );
                    }, 500);
                }

                onUpdate();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to claim mission');
        } finally {
            setIsClaiming(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatCost = (cost: Ship['cost']) => {
        const items = [];
        if (cost.metal > 0) items.push(`${cost.metal} 🔩`);
        if (cost.crystal > 0) items.push(`${cost.crystal} 💎`);
        if (cost.energy > 0) items.push(`${cost.energy} ⚡`);
        if (cost.credits > 0) items.push(`${cost.credits} 💰`);
        return items.join(' · ');
    };

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
                {/* HANGAR - Ship Crafting */}
                <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-cyan/30 rounded-xl p-6">
                    <h3 className="font-orbitron text-2xl font-bold text-neon-cyan mb-4 flex items-center gap-3">
                        <span>🏭</span>
                        Hangar
                    </h3>

                    <div className="space-y-4">
                        {SHIPS.map((ship) => {
                            const affordable = canAffordShip(ship);
                            const unlocked = isUnlocked(ship);
                            const owned = userShips[ship.id] || 0;

                            return (
                                <div
                                    key={ship.id}
                                    className={`
                    p-4 rounded-lg border-2 relative transition-all duration-300
                    ${unlocked
                                            ? 'bg-deepspace-900/50 border-neon-cyan/20'
                                            : 'bg-gray-900/50 border-gray-700/30 opacity-75'
                                        }
                  `}
                                >
                                    {!unlocked && (
                                        <div className="absolute top-2 right-2 text-gray-500 z-10">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl" style={{ filter: unlocked ? 'none' : 'grayscale(100%)' }}>
                                                {ship.icon}
                                            </span>
                                            <div>
                                                <h4 className={`font-orbitron font-bold ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                                                    {ship.name}
                                                </h4>
                                                <p className="text-xs text-gray-400 font-rajdhani">
                                                    {ship.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-orbitron text-2xl font-bold ${unlocked ? 'text-neon-cyan' : 'text-gray-600'}`}>
                                                {owned}
                                            </div>
                                            <div className="text-xs text-gray-500 font-rajdhani">Owned</div>
                                            {(damagedShips[ship.id] || 0) > 0 && (
                                                <div className="text-xs text-red-500 font-rajdhani font-bold animate-pulse">
                                                    {damagedShips[ship.id]} Damaged
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {unlocked ? (
                                        <>
                                            <div className="flex items-center justify-between text-xs font-rajdhani mb-3">
                                                <div>
                                                    <span className="text-gray-500">Cost: </span>
                                                    <span className={affordable ? 'text-neon-cyan' : 'text-red-400'}>
                                                        {formatCost(ship.cost)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs font-rajdhani mb-3">
                                                <div className="bg-deepspace-950/50 p-2 rounded">
                                                    <span className="text-gray-500">Speed: </span>
                                                    <span className="text-green-400">{ship.speedModifier}x</span>
                                                </div>
                                                <div className="bg-deepspace-950/50 p-2 rounded">
                                                    <span className="text-gray-500">Capacity: </span>
                                                    <span className="text-green-400">{ship.capacityModifier}x</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleCraftShip(ship.id)}
                                                disabled={!affordable || isCrafting}
                                                className="w-full px-4 py-2 bg-neon-cyan/20 border-2 border-neon-cyan rounded-lg font-orbitron font-bold text-neon-cyan hover:bg-neon-cyan/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isCrafting ? 'Crafting...' : 'Craft Ship'}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="mt-4 p-3 bg-gray-800/50 rounded text-center">
                                            <p className="text-xs text-red-400 font-rajdhani font-bold uppercase tracking-wider">
                                                Requires Technology: {ship.requiredTech?.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MISSION CONTROL */}
                <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-magenta/30 rounded-xl p-6">
                    <h3 className="font-orbitron text-2xl font-bold text-neon-magenta mb-4 flex items-center gap-3">
                        <span>🎯</span>
                        Mission Control
                    </h3>

                    {!activeMission ? (
                        // No active mission - show mission selection
                        <div className="space-y-4">
                            <p className="font-rajdhani text-gray-400 text-sm mb-4">
                                Select a mission and deploy your fleet
                            </p>

                            {MISSIONS.map((mission) => (
                                <button
                                    key={mission.id}
                                    onClick={() => setSelectedMission(mission.id)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${selectedMission === mission.id
                                        ? 'border-neon-amber bg-neon-amber/10'
                                        : 'border-neon-magenta/30 bg-deepspace-900/30 hover:border-neon-magenta/60'
                                        }`}
                                >
                                    <div className="flex items-start gap-3 mb-2">
                                        <span className="text-2xl">{mission.icon}</span>
                                        <div className="flex-1">
                                            <h4 className="font-orbitron font-bold text-white">{mission.name}</h4>
                                            <p className="text-xs text-gray-400 font-rajdhani">{mission.description}</p>
                                        </div>
                                        <span
                                            className={`text-xs font-rajdhani px-2 py-1 rounded ${mission.difficulty === 'Easy'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                                }`}
                                        >
                                            {mission.difficulty}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs font-rajdhani">
                                        <div>
                                            <span className="text-gray-500">Duration: </span>
                                            <span className="text-neon-cyan">{Math.floor(mission.duration / 60)} min</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Reward: </span>
                                            <span className="text-green-400">
                                                {mission.baseReward.metal > 0 && `${mission.baseReward.metal} 🔩`}
                                                {mission.baseReward.crystal > 0 && `${mission.baseReward.crystal} 💎`}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {selectedMission && (
                                <div className="mt-6 p-4 bg-deepspace-900/50 border border-neon-amber/30 rounded-lg">
                                    <h4 className="font-orbitron font-bold text-neon-amber mb-3">
                                        Launch Configuration
                                    </h4>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-rajdhani text-gray-400 mb-1">
                                                Ship Type
                                            </label>
                                            <select
                                                value={selectedShip}
                                                onChange={(e) => setSelectedShip(e.target.value)}
                                                className="w-full px-3 py-2 bg-deepspace-950 border border-neon-cyan/30 rounded font-rajdhani text-white"
                                            >
                                                {SHIPS.filter(s => isUnlocked(s)).map((ship) => (
                                                    <option key={ship.id} value={ship.id}>
                                                        {ship.icon} {ship.name} (Owned:{' '}
                                                        {userShips[ship.id] || 0})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-rajdhani text-gray-400 mb-1">
                                                Ship Count
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={userShips[selectedShip] || 1}
                                                value={shipCount}
                                                onChange={(e) => setShipCount(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full px-3 py-2 bg-deepspace-950 border border-neon-cyan/30 rounded font-rajdhani text-white"
                                            />
                                        </div>

                                        <button
                                            onClick={handleLaunchMission}
                                            disabled={
                                                isLaunching ||
                                                (userShips[selectedShip] || 0) < shipCount
                                            }
                                            className="w-full px-4 py-3 bg-neon-magenta/20 border-2 border-neon-magenta rounded-lg font-orbitron font-bold text-neon-magenta hover:bg-neon-magenta/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLaunching ? 'Launching...' : 'Launch Mission'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Active mission - show countdown
                        <div className="space-y-4">
                            <div className="p-6 bg-deepspace-900/50 border-2 border-neon-amber rounded-lg text-center">
                                <div className="text-4xl mb-2">🚀</div>
                                <h4 className="font-orbitron text-xl font-bold text-neon-amber mb-2">
                                    Mission In Progress
                                </h4>
                                <p className="font-rajdhani text-gray-400 text-sm mb-4">
                                    {MISSIONS.find((m) => m.id === activeMission.missionId)?.name || 'Unknown Mission'}
                                </p>

                                <div className="mb-4">
                                    <div className="font-orbitron text-5xl font-bold text-neon-cyan mb-2">
                                        {formatTime(timeRemaining)}
                                    </div>
                                    <div className="text-sm font-rajdhani text-gray-500">
                                        {missionComplete ? 'Mission Complete!' : 'Time Remaining'}
                                    </div>
                                </div>

                                {missionComplete ? (
                                    <button
                                        onClick={handleClaimMission}
                                        disabled={isClaiming}
                                        className="w-full px-6 py-3 bg-green-500/20 border-2 border-green-500 rounded-lg font-orbitron font-bold text-green-400 hover:bg-green-500/30 transition-all duration-300 animate-pulse hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] disabled:opacity-50"
                                    >
                                        {isClaiming ? 'Claiming...' : '✅ Claim Reward'}
                                    </button>
                                ) : (
                                    <div className="w-full h-2 bg-deepspace-950 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta transition-all duration-1000"
                                            style={{
                                                width: `${((MISSIONS.find((m) => m.id === activeMission.missionId)?.duration || 0) -
                                                    timeRemaining) /
                                                    (MISSIONS.find((m) => m.id === activeMission.missionId)?.duration || 1) *
                                                    100
                                                    }%`,
                                            }}
                                        ></div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-deepspace-900/30 border border-neon-cyan/20 rounded-lg">
                                <h5 className="font-rajdhani text-sm text-gray-400 mb-2">Mission Details</h5>
                                <div className="grid grid-cols-2 gap-2 text-xs font-rajdhani">
                                    <div>
                                        <span className="text-gray-500">Ships: </span>
                                        <span className="text-white">
                                            {activeMission.shipCount}x{' '}
                                            {SHIPS.find((s) => s.id === activeMission.shipId)?.name}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Potential Reward: </span>
                                        <span className="text-green-400">
                                            {activeMission.potentialReward.metal > 0 &&
                                                `${activeMission.potentialReward.metal} 🔩`}
                                            {activeMission.potentialReward.crystal > 0 &&
                                                `${activeMission.potentialReward.crystal} 💎`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FleetOperations;
