import React from 'react';
import { useSound } from '../contexts/SoundContext';
import { Music, Volume2, VolumeX } from 'lucide-react';

const SoundControls: React.FC = () => {
    const { toggleMute, isMuted, toggleMusic, musicEnabled } = useSound();

    return (
        <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
            <button
                onClick={toggleMusic}
                className={`p-1.5 rounded-md transition-colors ${musicEnabled ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20' : 'text-slate-500 hover:text-slate-400'}`}
                title="Toggle Music"
            >
                <Music size={16} />
            </button>
            <div className="w-[1px] h-4 bg-slate-700 mx-0.5"></div>
            <button
                onClick={toggleMute}
                className={`p-1.5 rounded-md transition-colors ${!isMuted ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20' : 'text-red-400 hover:text-red-300'}`}
                title="Toggle Sound"
            >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
        </div>
    );
};

export default SoundControls;
