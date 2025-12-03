import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-space-gradient">
            {/* Header */}
            <header className="border-b border-neon-cyan/20 bg-deepspace-950/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="font-orbitron text-2xl font-bold text-neon-cyan">
                            NEBULA STATION
                        </h1>
                        <p className="font-rajdhani text-sm text-gray-400">
                            Command Center
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg font-rajdhani font-semibold text-red-400 hover:bg-red-500/30 transition-all duration-200"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8 bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-cyan/30 rounded-xl p-8">
                    <h2 className="font-orbitron text-4xl font-bold text-neon-gradient mb-4">
                        Welcome, Commander {user.username}!
                    </h2>
                    <p className="font-rajdhani text-xl text-gray-300">
                        Your empire awaits your command.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Level */}
                    <div className="bg-deepspace-950/40 backdrop-blur-md border border-neon-cyan/30 rounded-xl p-6 hover:border-neon-cyan/60 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-rajdhani text-gray-400 uppercase text-sm">Level</span>
                            <span className="text-2xl">⭐</span>
                        </div>
                        <div className="font-orbitron text-3xl font-bold text-neon-cyan">
                            {user.level}
                        </div>
                        <div className="mt-2 font-rajdhani text-sm text-gray-500">
                            XP: {user.xp}
                        </div>
                    </div>

                    {/* Credits */}
                    <div className="bg-deepspace-950/40 backdrop-blur-md border border-neon-amber/30 rounded-xl p-6 hover:border-neon-amber/60 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-rajdhani text-gray-400 uppercase text-sm">Credits</span>
                            <span className="text-2xl">💎</span>
                        </div>
                        <div className="font-orbitron text-3xl font-bold text-neon-amber">
                            {user.credits.toLocaleString()}
                        </div>
                        <div className="mt-2 font-rajdhani text-sm text-gray-500">
                            Premium Currency
                        </div>
                    </div>
                </div>

                {/* Resources Section */}
                <div className="bg-deepspace-950/40 backdrop-blur-md border-2 border-neon-magenta/30 rounded-xl p-8 mb-8">
                    <h3 className="font-orbitron text-2xl font-bold text-neon-magenta mb-6 flex items-center gap-3">
                        <span>⚡</span>
                        Resources
                    </h3>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Metal */}
                        <div className="bg-deepspace-900/50 border border-neon-cyan/20 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">🔩</span>
                                <div>
                                    <div className="font-rajdhani text-sm text-gray-400 uppercase">Metal</div>
                                    <div className="font-orbitron text-2xl font-bold text-neon-cyan">
                                        {user.resources.metal.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full bg-deepspace-950 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-neon-cyan to-neon-blue h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((user.resources.metal / 1000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Crystal */}
                        <div className="bg-deepspace-900/50 border border-neon-magenta/20 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">💎</span>
                                <div>
                                    <div className="font-rajdhani text-sm text-gray-400 uppercase">Crystal</div>
                                    <div className="font-orbitron text-2xl font-bold text-neon-magenta">
                                        {user.resources.crystal.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full bg-deepspace-950 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-neon-magenta to-neon-purple h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((user.resources.crystal / 1000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Energy */}
                        <div className="bg-deepspace-900/50 border border-neon-amber/20 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">⚡</span>
                                <div>
                                    <div className="font-rajdhani text-sm text-gray-400 uppercase">Energy</div>
                                    <div className="font-orbitron text-2xl font-bold text-neon-amber">
                                        {user.resources.energy.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full bg-deepspace-950 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-neon-amber to-yellow-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((user.resources.energy / 1000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div className="bg-deepspace-950/40 backdrop-blur-md border border-neon-cyan/20 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="font-orbitron text-2xl font-bold text-gray-300 mb-2">
                        More Features Coming Soon
                    </h3>
                    <p className="font-rajdhani text-gray-400">
                        Fleet management, base building, and galactic conquest are under development.
                    </p>
                </div>
            </main>

            {/* Decorative corners */}
            <div className="fixed top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-neon-cyan/10 pointer-events-none"></div>
            <div className="fixed top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-neon-magenta/10 pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-neon-amber/10 pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-neon-cyan/10 pointer-events-none"></div>
        </div>
    );
};

export default Dashboard;
