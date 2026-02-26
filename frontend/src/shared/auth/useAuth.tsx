"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile } from '@/src/entities/user';
import { getMe, logout as apiLogout } from '@/src/features/auth/api';
import { ApiError } from '@/src/shared/api/error';

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    setUser: (user: UserProfile | null) => void;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshUser = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const userData = await getMe();
            setUser(userData);
            setError(null);
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                setUser(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch user');
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            error,
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
