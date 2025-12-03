import { useState } from 'react';
import AuthModal from './AuthModal';

const LandingPage = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [glowIntensity, setGlowIntensity] = useState(0);

    useState(() => {
        const interval = setInterval(() => {
            setGlowIntensity(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    });

    const openAuth = (mode: 'login' | 'register') => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    return (
        <div className="min-h-screen bg-space-gradient flex items-center justify-center relative overflow-hidden">
            {/* Animated background stars */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(100)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse-slow"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            opacity: Math.random() * 0.7 + 0.3,
                        }}
                    />
                ))}
            </div>

            {/* Scanning line effect */}
            <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-30"
                style={{
                    top: `${glowIntensity}%`,
                    transition: 'top 0.05s linear',
                }}
            ></div>

            {/* Main content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    {/* Logo/Title */}
                    <div className="mb-8">
                        <h1 className="font-orbitron text-8xl md:text-9xl font-black mb-4 tracking-wider">
                            <span className="text-neon-gradient animate-glow">
                                NEBULA
                            </span>
                        </h1>
                        <h2 className="font-orbitron text-5xl md:text-6xl font-bold tracking-widest text-neon-cyan mb-6">
                            STATION
                        </h2>
                        <div className="flex justify-center items-center gap-3 mb-8">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent to-neon-magenta"></div>
                            <p className="font-rajdhani text-2xl text-neon-magenta uppercase tracking-widest">
                                Command Your Destiny
                            </p>
                            <div className="h-px w-16 bg-gradient-to-l from-transparent to-neon-magenta"></div>
                        </div>
                    </div>

                    {/* Subtitle */}
                    <p className="font-rajdhani text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Build your empire among the stars. Command fleets, gather resources,
                        and dominate the galaxy in this next-generation space strategy game.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                        <button
                            onClick={() => openAuth('register')}
                            className="group relative px-8 py-4 bg-neon-cyan/10 backdrop-blur-md border-2 border-neon-cyan rounded-lg font-orbitron text-lg font-bold text-neon-cyan hover:bg-neon-cyan/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] min-w-[250px]"
                        >
                            <span className="relative z-10">Join the Fleet</span>
                            <div className="absolute inset-0 bg-neon-cyan/0 group-hover:bg-neon-cyan/10 rounded-lg transition-all duration-300"></div>
                        </button>

                        <button
                            onClick={() => openAuth('login')}
                            className="group relative px-8 py-4 bg-deepspace-900/50 backdrop-blur-md border-2 border-neon-magenta/50 rounded-lg font-orbitron text-lg font-semibold text-gray-200 hover:border-neon-magenta hover:text-neon-magenta transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,255,0.3)] min-w-[250px]"
                        >
                            <span className="relative z-10">Commander Login</span>
                        </button>
                    </div>
                </div>

                {/* Features Grid - Glassmorphism Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {/* Feature 1 */}
                    <div className="group relative bg-deepspace-950/40 backdrop-blur-md border border-neon-cyan/30 rounded-xl p-6 hover:border-neon-cyan/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                        <div className="text-4xl mb-4">🚀</div>
                        <h3 className="font-orbitron text-xl font-bold text-neon-cyan mb-3">
                            Epic Space Battles
                        </h3>
                        <p className="font-rajdhani text-gray-400 leading-relaxed">
                            Command massive fleets and engage in strategic warfare across the cosmos.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group relative bg-deepspace-950/40 backdrop-blur-md border border-neon-magenta/30 rounded-xl p-6 hover:border-neon-magenta/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,255,0.2)]">
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="font-orbitron text-xl font-bold text-neon-magenta mb-3">
                            Resource Management
                        </h3>
                        <p className="font-rajdhani text-gray-400 leading-relaxed">
                            Mine precious metals, crystals, and energy to fuel your empire's growth.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group relative bg-deepspace-950/40 backdrop-blur-md border border-neon-amber/30 rounded-xl p-6 hover:border-neon-amber/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,191,0,0.2)]">
                        <div className="text-4xl mb-4">🌌</div>
                        <h3 className="font-orbitron text-xl font-bold text-neon-amber mb-3">
                            Galactic Domination
                        </h3>
                        <p className="font-rajdhani text-gray-400 leading-relaxed">
                            Expand your territory and become the supreme ruler of the galaxy.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="flex flex-wrap justify-center gap-8 text-center">
                    <div className="bg-deepspace-950/30 backdrop-blur-sm border border-neon-cyan/20 rounded-lg px-6 py-4">
                        <div className="font-orbitron text-3xl font-bold text-neon-cyan mb-1">1000+</div>
                        <div className="font-rajdhani text-sm text-gray-400 uppercase tracking-wide">Active Commanders</div>
                    </div>
                    <div className="bg-deepspace-950/30 backdrop-blur-sm border border-neon-magenta/20 rounded-lg px-6 py-4">
                        <div className="font-orbitron text-3xl font-bold text-neon-magenta mb-1">50+</div>
                        <div className="font-rajdhani text-sm text-gray-400 uppercase tracking-wide">Star Systems</div>
                    </div>
                    <div className="bg-deepspace-950/30 backdrop-blur-sm border border-neon-amber/20 rounded-lg px-6 py-4">
                        <div className="font-orbitron text-3xl font-bold text-neon-amber mb-1">24/7</div>
                        <div className="font-rajdhani text-sm text-gray-400 uppercase tracking-wide">Real-Time Action</div>
                    </div>
                </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-neon-cyan/20"></div>
            <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-neon-magenta/20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-neon-amber/20"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-neon-cyan/20"></div>

            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setShowAuthModal(false)}
                    onSwitchMode={(mode) => setAuthMode(mode)}
                />
            )}
        </div>
    );
};

export default LandingPage;
