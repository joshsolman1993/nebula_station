import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Database, Rocket, Map,
    Shield, ShoppingBag, Trophy,
    User, X, Settings, Terminal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const MENU_GROUPS = [
    {
        title: 'Command',
        items: [
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { label: 'Research', path: '/research', icon: Database },
            { label: 'Talents', path: '/talents', icon: Terminal }, // Using Terminal for Talents/Skills
            { label: 'Vault', path: '/vault', icon: Database }, // Reusing Database or Box for Vault
        ]
    },
    {
        title: 'Operations',
        items: [
            { label: 'Fleet', path: '/fleet', icon: Rocket },
            { label: 'Galaxy', path: '/galaxy', icon: Map },
            { label: 'Missions', path: '/operations', icon: Rocket }, // Using Rocket again or maybe Compass
        ]
    },
    {
        title: 'Society',
        items: [
            { label: 'Alliance', path: '/alliance', icon: Shield },
            { label: 'Market', path: '/market', icon: ShoppingBag },
            { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        ]
    }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50 h-screen
                    w-64 bg-deepspace-950/90 backdrop-blur-xl border-r border-neon-cyan/20
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col
                `}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
                    <Rocket className="w-8 h-8 text-blue-500 mr-3" />
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        Nebula Station
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="ml-auto lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
                    {MENU_GROUPS.map((group) => (
                        <div key={group.title}>
                            <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsOpen(false)} // Close on mobile click
                                            className={`
                                                flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${active
                                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                                            `}
                                        >
                                            <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* System Group (Static bottom or standard) */}
                    <div>
                        <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            System
                        </h3>
                        <div className="space-y-1">
                            <Link
                                to="/profile"
                                className={`
                                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${isActive('/profile')
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                                `}
                            >
                                <User className="w-5 h-5 mr-3" />
                                Profile
                            </Link>
                            {user?.role === 'admin' && (
                                <Link
                                    to="/admin"
                                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20"
                                >
                                    <Settings className="w-5 h-5 mr-3" />
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Mini Profile (Bottom) */}
                <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                            {user?.username?.substring(0, 2).toUpperCase() || 'CM'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                                {user?.username || 'Commander'}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                                Lvl {user?.level || 1} • {user?.role || 'User'}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
