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
        const id = Date.now();
        setToasts(prev => [...prev, { ...props, id }]);

        // 自動で消去（3秒後）
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
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
