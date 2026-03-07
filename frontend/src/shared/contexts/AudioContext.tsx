"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface AudioContextType {
    isMuted: boolean;
    toggleMute: () => void;
    currentTrack: string | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const BGM_DEFAULT = '/audio/bgm.mp3';
const BGM_BATTLE = '/audio/bgm_battle.mp3';

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pathname = usePathname();
    const [currentTrack, setCurrentTrack] = useState<string>(BGM_DEFAULT);

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio();
        audio.loop = true;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    // Track switching logic based on pathname
    useEffect(() => {
        const isBattle = pathname.startsWith('/battle/');
        const targetTrack = isBattle ? BGM_BATTLE : BGM_DEFAULT;

        if (targetTrack !== currentTrack) {
            setCurrentTrack(targetTrack);
        }
    }, [pathname, currentTrack]);

    // Handle track source and playback
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;
        const wasPlaying = !audio.paused;

        // Save current time before switching? Usually for BGM switching it's better to restart or crossfade
        // but here we just swap source.
        audio.src = currentTrack;
        audio.load();

        if (!isMuted) {
            audio.play().catch(err => console.error("Audio playback failed:", err));
        }
    }, [currentTrack, isMuted]);

    // Handle mute/unmute
    useEffect(() => {
        if (!audioRef.current) return;

        if (isMuted) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
        }
    }, [isMuted]);

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    return (
        <AudioContext.Provider value={{ isMuted, toggleMute, currentTrack }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
