import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

interface SoundContextType {
    playSfx: (name: string) => void;
    toggleMusic: () => void;
    toggleMute: () => void;
    isMuted: boolean;
    musicEnabled: boolean;
    volume: number;
    setVolume: (vol: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem('nebula_sound_muted');
        return saved ? JSON.parse(saved) : false;
    });

    const [musicEnabled, setMusicEnabled] = useState(() => {
        const saved = localStorage.getItem('nebula_music_enabled');
        return saved ? JSON.parse(saved) : false; // Default to off to respect autoplay policies
    });

    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem('nebula_volume');
        return saved ? parseFloat(saved) : 0.5;
    });

    const bgmRef = useRef<Howl | null>(null);
    const sfxCache = useRef<{ [key: string]: Howl }>({});

    // Initialize BGM
    useEffect(() => {
        if (!bgmRef.current) {
            bgmRef.current = new Howl({
                src: ['/sounds/bgm.mp3'],
                html5: false, // Use Web Audio API to avoid Audio pool limits
                loop: true,
                volume: volume * 0.5, // Background music slightly quieter
                autoplay: false
            });
        }

        return () => {
            bgmRef.current?.unload();
        };
    }, []);

    // Handle Music State
    useEffect(() => {
        if (bgmRef.current) {
            if (musicEnabled && !isMuted) {
                if (!bgmRef.current.playing()) {
                    bgmRef.current.play();
                    bgmRef.current.fade(0, volume * 0.5, 1000);
                }
            } else {
                bgmRef.current.pause();
            }
        }
        localStorage.setItem('nebula_music_enabled', JSON.stringify(musicEnabled));
    }, [musicEnabled, isMuted, volume]);

    // Handle Mute State
    useEffect(() => {
        Howler.mute(isMuted);
        localStorage.setItem('nebula_sound_muted', JSON.stringify(isMuted));
    }, [isMuted]);

    // Handle Volume
    useEffect(() => {
        Howler.volume(volume);
        if (bgmRef.current) {
            bgmRef.current.volume(volume * 0.5);
        }
        localStorage.setItem('nebula_volume', volume.toString());
    }, [volume]);

    const playSfx = (name: string) => {
        if (isMuted) return;

        // Preload/Cache SFX
        if (!sfxCache.current[name]) {
            sfxCache.current[name] = new Howl({
                src: [`/sounds/${name}.mp3`],
                volume: 1.0
            });
        }

        sfxCache.current[name].play();
    };

    const toggleMusic = () => setMusicEnabled(prev => !prev);
    const toggleMute = () => setIsMuted(prev => !prev);

    return (
        <SoundContext.Provider value={{
            playSfx,
            toggleMusic,
            toggleMute,
            isMuted,
            musicEnabled,
            volume,
            setVolume
        }}>
            {children}
        </SoundContext.Provider>
    );
};
