"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { syncManager } from '@/src/shared/api/SyncManager';

interface NetworkStatusContextType {
    isOnline: boolean;
    isManualOffline: boolean;
    setManualOffline: (value: boolean) => void;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
    isOnline: true,
    isManualOffline: false,
    setManualOffline: () => { }
});

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [navigatorOnline, setNavigatorOnline] = useState<boolean>(
        typeof window !== 'undefined' ? navigator.onLine : true
    );
    const [isManualOffline, setIsManualOfflineState] = useState<boolean>(false);

    // Load manual offline state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('aiq_manual_offline');
        if (saved === 'true') {
            setIsManualOfflineState(true);
        }
    }, []);

    const setManualOffline = (value: boolean) => {
        setIsManualOfflineState(value);
        localStorage.setItem('aiq_manual_offline', value ? 'true' : 'false');
        if (!value) {
            import('@/src/shared/api/SyncManager').then(({ syncManager }) => {
                syncManager.sync();
            });
        }
    };

    useEffect(() => {
        const handleOnline = () => setNavigatorOnline(true);
        const handleOffline = () => setNavigatorOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const isOnline = navigatorOnline && !isManualOffline;

    return (
        <NetworkStatusContext.Provider value={{ isOnline, isManualOffline, setManualOffline }}>
            {children}
        </NetworkStatusContext.Provider>
    );
};

export const useNetworkStatus = () => useContext(NetworkStatusContext);
