import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Rocket, Trophy, UserCircle, LogOut, Sparkles, Brain, Box, Sword, ShieldAlert, ShoppingBag, Volume2, VolumeX, Music, Star, Map as MapIcon, Shield } from 'lucide-react';
import { useSound } from '../contexts/SoundContext';

const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { playSfx, toggleMute, isMuted, toggleMusic, musicEnabled } = useSound();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/fleet', label: 'Fleet', icon: Rocket },
        { path: '/galaxy', label: 'Galaxy', icon: MapIcon },
        { path: '/alliance', label: 'Alliance', icon: Shield },
        { path: '/operations', label: 'Operations', icon: Sword },
        { path: '/research', label: 'Research', icon: Brain },
        { path: '/talents', label: 'Talents', icon: Star, badge: user?.talentPoints },
        { path: '/market', label: 'Market', icon: ShoppingBag },
        { path: '/vault', label: 'Vault', icon: Box },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
        { path: '/profile', label: 'Profile', icon: UserCircle },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-deepspace-950/80 backdrop-blur-xl border-b-2 border-neon-cyan/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-neon-cyan" />
                        <div>
                            <h1 className="font-orbitron text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                                NEBULA STATION
                            </h1>
                            {user && (
                                <p className="font-rajdhani text-xs text-gray-400">
                                    Commander {user.username}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-2">
                        {/* Audio Controls */}
                        <div className="flex items-center gap-1 mr-2 border-r border-gray-700 pr-2">
                            <button
                                onClick={toggleMusic}
                                className={`p-2 rounded-lg transition-colors ${musicEnabled ? 'text-purple-400 hover:text-purple-300' : 'text-gray-600 hover:text-gray-500'}`}
                                title="Toggle Music"
                            >
                                <Music size={18} />
                            </button>
                            <button
                                onClick={toggleMute}
                                className={`p-2 rounded-lg transition-colors ${!isMuted ? 'text-cyan-400 hover:text-cyan-300' : 'text-red-500 hover:text-red-400'}`}
                                title="Toggle Sound"
                            >
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                        </div>

                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => playSfx('ui_click')}
                                    className={`
                    px-4 py-2 rounded-lg font-rajdhani font-semibold text-sm
                    transition-all duration-300 flex items-center gap-2
                    ${isActive(item.path)
                                            ? 'bg-neon-cyan/20 border-2 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                                            : 'border-2 border-transparent text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/30'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden md:inline">{item.label}</span>
                                    {item.badge && item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {user?.role === 'admin' && (
                            <Link
                                to="/admin"
                                onClick={() => playSfx('ui_click')}
                                className={`
                                    px-4 py-2 rounded-lg font-rajdhani font-semibold text-sm
                                    transition-all duration-300 flex items-center gap-2
                                    ${isActive('/admin')
                                        ? 'bg-red-600/20 border-2 border-red-600 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                                        : 'border-2 border-transparent text-red-500 hover:text-red-400 hover:border-red-600/30'
                                    }
                                `}
                            >
                                <ShieldAlert className="w-4 h-4" />
                                <span className="hidden md:inline">ADMIN</span>
                            </Link>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                playSfx('ui_click');
                                logout();
                            }}
                            className="ml-4 px-4 py-2 bg-red-500/20 border-2 border-red-500/50 rounded-lg font-rajdhani font-semibold text-sm text-red-400 hover:bg-red-500/30 transition-all duration-200 flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Decorative line */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-neon-cyan to-transparent"></div>
        </nav>
    );
};

export default Navbar;
