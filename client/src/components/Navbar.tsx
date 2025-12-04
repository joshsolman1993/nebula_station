import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Rocket, Trophy, UserCircle, LogOut, Sparkles, Brain } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/fleet', label: 'Fleet', icon: Rocket },
        { path: '/research', label: 'Research', icon: Brain },
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
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
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
                                </Link>
                            );
                        })}

                        {/* Logout Button */}
                        <button
                            onClick={logout}
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
