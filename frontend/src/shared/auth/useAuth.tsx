"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile } from '@/src/entities/user';
import { getMe, logout as apiLogout } from '@/src/features/auth/api';
import { ApiError } from '@/src/shared/api/error';
import { isOfflineError as isOfflineErr } from '@/src/shared/api/isOfflineError';
import { useNetworkStatus } from '@/src/shared/contexts/NetworkStatusContext';
import { warmupServer } from '@/src/shared/api/serverHealth';

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    isTechnicalError: boolean;
    setUser: (user: UserProfile | null) => void;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTechnicalError, setIsTechnicalError] = useState(false);

    const refreshUser = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            setUser(null);
            setLoading(false);
            setIsTechnicalError(false);
            return;
        }

        const cachedUserStr = typeof window !== 'undefined' ? localStorage.getItem('aiq_user_profile') : null;
        let cachedUser: UserProfile | null = null;
        if (cachedUserStr) {
            try {
                cachedUser = JSON.parse(cachedUserStr) as UserProfile;
            } catch {
                cachedUser = null;
            }
        }

        setLoading(true);
        setIsTechnicalError(false);

        try {
            const userData = await getMe();
            setUser(userData);
            if (typeof window !== 'undefined') {
                localStorage.setItem('aiq_user_profile', JSON.stringify(userData));
            }
            setError(null);
            setIsTechnicalError(false);
            setLoading(false);
            return;
        } catch (err) {
            const isManualOffline = typeof window !== 'undefined' && localStorage.getItem('aiq_manual_offline') === 'true';
            const isAuthError = err instanceof ApiError && err.status === 401;

            if (isAuthError) {
                setUser(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('aiq_user_profile');
                }
                setError(null);
            } else if (isManualOffline || isOfflineErr(err)) {
                // オフライン時はキャッシュがあればそれを使用し、エラーは表示しない
                if (cachedUser) {
                    setUser(cachedUser);
                    setError(null);
                } else {
                    setError('オフラインです。データを利用するには一度オンラインで読み込む必要があります。');
                }
                setIsTechnicalError(false);
            } else {
                // キャッシュがない場合のみエラーを表示
                if (!cachedUser) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch user');
                    setIsTechnicalError(true);
                }
            }
        }
        setLoading(false);
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('aiq_user_profile');
        }
    };

    const { isOnline } = useNetworkStatus();
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        void warmupServer();
        refreshUser();
    }, []);

    // オンラインに復帰した際にユーザー情報を再検証する
    useEffect(() => {
        if (isOnline && wasOffline) {
            refreshUser();
            setWasOffline(false);
        } else if (!isOnline) {
            setWasOffline(true);
        }
    }, [isOnline, wasOffline]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            error,
            isTechnicalError,
            setUser,
            refreshUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
