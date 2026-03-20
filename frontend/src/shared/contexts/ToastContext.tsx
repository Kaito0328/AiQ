"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProps } from '@/src/design/baseComponents/Toast';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';

interface ToastItem extends ToastProps {
    id: number;
}

interface ToastContextType {
    showToast: (props: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((props: Omit<ToastProps, 'onClose'>) => {
        // Prevent duplicate toasts with the same message from flooding the UI
        setToasts(prev => {
            const isDuplicate = prev.some(t => t.message === props.message && t.variant === props.variant);
            if (isDuplicate) return prev;

            const id = Date.now();
            const newToast = { ...props, id };

            // Auto-remove after 3 seconds
            setTimeout(() => {
                setToasts(current => current.filter(t => t.id !== id));
            }, 3000);

            if (props.variant === 'success') {
                // Keep only one success toast on screen; replace previous success toasts.
                const next = prev.filter(t => t.variant !== 'success');
                return [...next, newToast];
            }

            return [...prev, newToast];
        });
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* トースト表示コンテナ - 生の div を排除し View プリミティブを使用 */}
            <View
                className="fixed bottom-4 right-4 z-tooltip pointer-events-none"
            >
                <Stack gap="sm">
                    {toasts.map(toast => (
                        <View key={toast.id} className="pointer-events-auto animate-in slide-in-from-right-5 fade-in">
                            <Toast
                                {...toast}
                                onClose={() => removeToast(toast.id)}
                            />
                        </View>
                    ))}
                </Stack>
            </View>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
