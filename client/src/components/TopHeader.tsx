import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Zap, Box, Diamond, Coins, Bell } from 'lucide-react';
import SoundControls from './SoundControls';

interface TopHeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ setSidebarOpen }) => {
    const { user, logout } = useAuth();

    const formatNumber = (num: number | undefined) => {
        if (num === undefined) return 0;
        return num.toLocaleString();
    };

    return (
        <header className="h-16 bg-slate-900/80 border-b border-slate-800 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40">
            {/* Left: Mobile Toggle & Breadcrumbs (Future) */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Right: Resources & Controls */}
            <div className="flex items-center gap-4 md:gap-6">

                {/* Resource Display - Hidden on very small screens, scrollable or abbreviated */}
                <div className="hidden md:flex items-center gap-4 bg-slate-950/50 px-4 py-2 rounded-full border border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-blue-300" title="Metal">
                        <Box className="w-4 h-4" />
                        <span className="text-sm font-bold font-mono">{formatNumber(user?.resources?.metal)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-300" title="Crystal">
                        <Diamond className="w-4 h-4" />
                        <span className="text-sm font-bold font-mono">{formatNumber(user?.resources?.crystal)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-yellow-300" title="Energy">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-bold font-mono">{formatNumber(user?.resources?.energy)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-400 border-l border-slate-700 pl-4" title="Credits">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm font-bold font-mono">{formatNumber(user?.credits)}</span>
                    </div>
                </div>

                {/* Mobile Resources Compact View (Optional, showing only credits or energy) */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-300" title="Energy">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-bold font-mono">{formatNumber(user?.resources?.energy)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <SoundControls />

                    <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                    </button>

                    <div className="h-8 w-[1px] bg-slate-800 mx-1"></div>

                    <button
                        onClick={logout}
                        className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors px-2"
                    >
                        LOGOUT
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
