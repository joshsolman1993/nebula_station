import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { marketService, type MarketListing } from '../services/marketService';
import { ShoppingBag, Plus, X, RefreshCw, Coins, Package, Gem, Zap, Hammer } from 'lucide-react';
import toast from 'react-hot-toast';

import { useSound } from '../contexts/SoundContext';

const Market: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { playSfx } = useSound();
    const [listings, setListings] = useState<MarketListing[]>([]);
    const [activeTab, setActiveTab] = useState<'resources' | 'artifacts' | 'mine'>('resources');
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create Listing Form State
    const [listingType, setListingType] = useState<'RESOURCE' | 'ARTIFACT'>('RESOURCE');
    const [resourceType, setResourceType] = useState<'metal' | 'crystal' | 'energy'>('metal');
    const [amount, setAmount] = useState(100);
    const [price, setPrice] = useState(50);

    useEffect(() => {
        fetchListings();
    }, [activeTab]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            let typeFilter = '';
            if (activeTab === 'resources') typeFilter = 'RESOURCE';
            if (activeTab === 'artifacts') typeFilter = 'ARTIFACT';

            // For 'mine', we fetch all and filter client-side or add backend support. 
            // Let's fetch all for now if 'mine' to simplify, or just fetch by type if not mine.
            // Actually, backend supports type filter.

            const res = await marketService.getListings(activeTab === 'mine' ? undefined : typeFilter);
            if (res.success && res.data) {
                if (activeTab === 'mine') {
                    setListings(res.data.filter(l => l.seller._id === user?.id));
                } else {
                    setListings(res.data.filter(l => l.seller._id !== user?.id));
                }
            }
        } catch (error) {
            console.error('Failed to fetch listings', error);
            toast.error('Failed to load market data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateListing = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const content = listingType === 'RESOURCE'
                ? { resourceType, amount: Number(amount) }
                : { /* Artifact logic placeholder */ };

            const res = await marketService.createListing({
                type: listingType,
                content,
                price: Number(price)
            });

            if (res.success) {
                toast.success('Listing created successfully!');
                setIsCreateModalOpen(false);
                if (res.data && res.data.user) {
                    // Update user state with new resources/inventory
                    // We need a way to update the context user. 
                    // Assuming updateUser is available or we trigger a reload.
                    // The response includes the updated user object structure (partial).
                    // Ideally, we should refetch user profile or merge state.
                    // For now, let's just refresh the listings.
                }
                fetchListings();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create listing');
        }
    };

    const handleBuy = async (listingId: string, listingPrice: number) => {
        if (!user || user.credits < listingPrice) {
            toast.error('Insufficient Credits!');
            return;
        }

        try {
            const res = await marketService.buyListing(listingId);
            if (res.success) {
                playSfx('coins');
                toast.success('Purchase successful!');
                fetchListings();
                // Ideally update user credits in context
            }
        } catch (error: any) {
            toast.error(error.message || 'Purchase failed');
        }
    };

    const handleCancel = async (listingId: string) => {
        try {
            const res = await marketService.cancelListing(listingId);
            if (res.success) {
                toast.success('Listing cancelled');
                fetchListings();
            }
        } catch (error: any) {
            toast.error(error.message || 'Cancellation failed');
        }
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'metal': return <Hammer size={16} className="text-gray-400" />;
            case 'crystal': return <Gem size={16} className="text-purple-400" />;
            case 'energy': return <Zap size={16} className="text-yellow-400" />;
            default: return <Package size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 pb-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center gap-3">
                            <ShoppingBag size={32} />
                            GALACTIC EXCHANGE
                        </h1>
                        <p className="text-gray-400 mt-1">Trade resources and artifacts across the nebula</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-black/50 px-4 py-2 rounded-full border border-yellow-500/30 flex items-center gap-2">
                            <Coins size={16} className="text-yellow-500" />
                            <span className="font-bold text-yellow-100">{user?.credits.toLocaleString()} CR</span>
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-4 py-2 rounded font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/20"
                        >
                            <Plus size={18} />
                            CREATE LISTING
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`pb-3 px-4 font-bold transition-colors relative ${activeTab === 'resources' ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        RESOURCES
                        {activeTab === 'resources' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('artifacts')}
                        className={`pb-3 px-4 font-bold transition-colors relative ${activeTab === 'artifacts' ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        ARTIFACTS
                        {activeTab === 'artifacts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('mine')}
                        className={`pb-3 px-4 font-bold transition-colors relative ${activeTab === 'mine' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        MY LISTINGS
                        {activeTab === 'mine' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />}
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <RefreshCw className="animate-spin text-gray-500" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listings.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-gray-500 italic">
                                No active listings found in this sector.
                            </div>
                        ) : (
                            listings.map(listing => (
                                <div key={listing._id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        {listing.type === 'RESOURCE' ? <Package size={64} /> : <Gem size={64} />}
                                    </div>

                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${listing.type === 'RESOURCE' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                                                {listing.type === 'RESOURCE' ? getResourceIcon(listing.content.resourceType) : <Gem size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">
                                                    {listing.type === 'RESOURCE'
                                                        ? `${listing.content.amount} ${listing.content.resourceType.toUpperCase()}`
                                                        : 'Unknown Artifact'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Seller: <span className="text-gray-300">{listing.seller.username}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        <div className="text-yellow-400 font-bold text-xl flex items-center gap-1">
                                            <Coins size={18} />
                                            {listing.price}
                                        </div>

                                        {activeTab === 'mine' ? (
                                            <button
                                                onClick={() => handleCancel(listing._id)}
                                                className="bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1 rounded text-sm font-bold border border-red-800 transition-colors"
                                            >
                                                CANCEL
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBuy(listing._id, listing.price)}
                                                disabled={user && user.credits < listing.price}
                                                className={`px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2 transition-all
                                                    ${user && user.credits >= listing.price
                                                        ? 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_10px_rgba(202,138,4,0.3)]'
                                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                            >
                                                BUY
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Create Listing Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus size={20} className="text-green-500" />
                                Create New Listing
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateListing} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Listing Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setListingType('RESOURCE')}
                                        className={`py-2 rounded font-bold text-sm transition-colors ${listingType === 'RESOURCE' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        RESOURCE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setListingType('ARTIFACT')}
                                        className={`py-2 rounded font-bold text-sm transition-colors ${listingType === 'ARTIFACT' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        ARTIFACT
                                    </button>
                                </div>
                            </div>

                            {listingType === 'RESOURCE' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Resource</label>
                                        <select
                                            value={resourceType}
                                            onChange={(e) => setResourceType(e.target.value as any)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="metal">Metal</option>
                                            <option value="crystal">Crystal</option>
                                            <option value="energy">Energy</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                                        />
                                        <div className="text-right text-xs text-gray-500 mt-1">
                                            Available: {user?.resources[resourceType]}
                                        </div>
                                    </div>
                                </>
                            )}

                            {listingType === 'ARTIFACT' && (
                                <div className="p-4 bg-gray-800/50 rounded text-center text-gray-400 text-sm">
                                    Artifact trading coming soon...
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price (Credits)</label>
                                <div className="relative">
                                    <Coins size={16} className="absolute left-3 top-2.5 text-yellow-500" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 pl-9 text-white focus:outline-none focus:border-yellow-500"
                                    />
                                </div>
                                <div className="text-right text-xs text-gray-500 mt-1">
                                    Tax (5%): {Math.floor(price * 0.05)} CR
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={listingType === 'ARTIFACT'}
                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                CREATE LISTING
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Market;
