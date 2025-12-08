import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gameService from '../services/gameService';
import { ARTIFACTS } from '../config/gameData';
import type { Artifact } from '../config/gameData';
import { Box, Cpu, Drill, Zap, Hexagon, Hammer, Scan, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';

const Vault = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState<{ itemId: string; quantity: number }[]>([]);
    const [equipment, setEquipment] = useState<{ toolSlot: string | null; coreSlot: string | null }>({ toolSlot: null, coreSlot: null });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setInventory(user.inventory || []);
            setEquipment(user.equipment || { toolSlot: null, coreSlot: null });
        }
    }, [user]);

    const getArtifact = (id: string): Artifact | undefined => {
        return ARTIFACTS.find(a => a.id === id);
    };

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'DRILL': return <Drill className="w-6 h-6" />;
            case 'LENS': return <Scan className="w-6 h-6" />;
            case 'ENGINE': return <Rocket className="w-6 h-6" />;
            case 'CHIP': return <Cpu className="w-6 h-6" />;
            case 'SCANNER': return <Scan className="w-6 h-6" />;
            default: return <Box className="w-6 h-6" />;
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'border-gray-400 text-gray-400';
            case 'rare': return 'border-blue-400 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]';
            case 'epic': return 'border-purple-400 text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)]';
            case 'legendary': return 'border-yellow-400 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]';
            default: return 'border-gray-400 text-gray-400';
        }
    };

    const handleEquip = async (itemId: string, slot: string) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await gameService.equipItem(itemId, slot);
            if (response.success) {
                toast.success(response.message);
                // Force reload to update context/resources
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to equip item');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnequip = async (slot: string) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await gameService.unequipItem(slot);
            if (response.success) {
                toast.success(response.message);
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to unequip item');
        } finally {
            setIsLoading(false);
        }
    };

    const renderEquipmentSlot = (slotName: 'tool' | 'core', title: string, icon: any) => {
        const equippedItemId = slotName === 'tool' ? equipment.toolSlot : equipment.coreSlot;
        const equippedItem = equippedItemId ? getArtifact(equippedItemId) : null;

        return (
            <div className="bg-deepspace-900/50 border border-neon-cyan/20 rounded-xl p-6 flex flex-col items-center justify-center relative min-h-[200px]">
                <div className="absolute top-4 left-4 flex items-center gap-2 text-neon-cyan/70">
                    {icon}
                    <span className="font-orbitron text-sm tracking-wider">{title}</span>
                </div>

                {equippedItem ? (
                    <div className="flex flex-col items-center gap-4 mt-6 w-full">
                        <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center bg-black/40 ${getRarityColor(equippedItem.rarity)}`}>
                            {getIcon(equippedItem.icon)}
                        </div>
                        <div className="text-center">
                            <h3 className={`font-orbitron font-bold text-lg ${getRarityColor(equippedItem.rarity).split(' ')[1]}`}>
                                {equippedItem.name}
                            </h3>
                            <p className="text-gray-400 text-xs font-rajdhani mt-1 max-w-[200px]">
                                {equippedItem.effect.type === 'production_bonus'
                                    ? `+${(equippedItem.effect.value * 100).toFixed(0)}% ${equippedItem.effect.resource} Production`
                                    : `-${(equippedItem.effect.value * 100).toFixed(0)}% Mission Duration`}
                            </p>
                        </div>
                        <button
                            onClick={() => handleUnequip(slotName)}
                            disabled={isLoading}
                            className="mt-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-orbitron hover:bg-red-500/30 transition-all"
                        >
                            UNEQUIP
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 mt-6 opacity-30">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center">
                            <Box className="w-8 h-8 text-gray-500" />
                        </div>
                        <span className="text-gray-500 font-rajdhani">Empty Slot</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 pb-24">
            <header className="mb-8">
                <h1 className="text-4xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-magenta">
                    THE VAULT
                </h1>
                <p className="text-gray-400 font-rajdhani mt-2 text-lg">
                    Manage your artifacts and equipment to enhance station efficiency.
                </p>
            </header>

            {/* Active Equipment */}
            <section className="mb-12">
                <h2 className="text-2xl font-orbitron text-white mb-6 flex items-center gap-2">
                    <Zap className="text-yellow-400" /> Active Equipment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderEquipmentSlot('tool', 'TOOL SLOT', <Hammer className="w-4 h-4" />)}
                    {renderEquipmentSlot('core', 'CORE SLOT', <Hexagon className="w-4 h-4" />)}
                </div>
            </section>

            {/* Inventory */}
            <section>
                <h2 className="text-2xl font-orbitron text-white mb-6 flex items-center gap-2">
                    <Box className="text-neon-cyan" /> Artifact Storage
                </h2>

                {inventory.length === 0 ? (
                    <div className="bg-deepspace-900/30 border border-gray-800 rounded-xl p-12 text-center">
                        <Box className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl text-gray-500 font-orbitron">Vault Empty</h3>
                        <p className="text-gray-600 font-rajdhani mt-2">
                            Complete missions to discover ancient artifacts.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {inventory.map((item, index) => {
                            const artifact = getArtifact(item.itemId);
                            if (!artifact) return null;

                            return (
                                <div key={`${item.itemId}-${index}`} className="bg-deepspace-900/80 border border-gray-800 rounded-xl p-4 hover:border-neon-cyan/50 transition-all group relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-black/50 ${getRarityColor(artifact.rarity).split(' ')[1]}`}>
                                        {artifact.rarity}
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-lg border flex items-center justify-center bg-black/40 shrink-0 ${getRarityColor(artifact.rarity)}`}>
                                            {getIcon(artifact.icon)}
                                        </div>
                                        <div>
                                            <h4 className="font-orbitron text-white text-sm">{artifact.name}</h4>
                                            <p className="text-gray-400 text-xs font-rajdhani mt-1 line-clamp-2">
                                                {artifact.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                                        <div className="text-xs text-neon-cyan font-rajdhani">
                                            {artifact.effect.type === 'production_bonus'
                                                ? `+${(artifact.effect.value * 100).toFixed(0)}% ${artifact.effect.resource}`
                                                : `-${(artifact.effect.value * 100).toFixed(0)}% Duration`}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 text-xs">x{item.quantity}</span>
                                            <button
                                                onClick={() => handleEquip(artifact.id, artifact.slot)}
                                                disabled={isLoading}
                                                className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded text-neon-cyan text-xs hover:bg-neon-cyan/20 transition-colors"
                                            >
                                                EQUIP
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Vault;
