import React, { useEffect } from 'react';
import { cn } from '@/src/shared/utils/cn';
import { View } from '../primitives/View';
import { Flex } from '../primitives/Flex';
import { Text } from '../baseComponents/Text';
import { IconButton } from '../baseComponents/IconButton';
import { Portal } from '../primitives/Portal';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    centerTitle?: boolean;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

/**
 * オーバーレイとダイアログを組み合わせたモーダルコンポーネントです。
 */
export function Modal({ isOpen, onClose, title, children, footer, size = 'md', centerTitle = false }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Portal>
            <View
                className="fixed inset-0 flex items-start pt-[12dvh] sm:pt-0 sm:items-center justify-center p-4 z-[9999]"
            >
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fast animate-in fade-in"
                    onClick={onClose}
                />

                {/* Dialog Content */}
                <View
                    bg="card"
                    rounded="lg"
                    shadow="lg"
                    className={cn(
                        "relative w-full flex flex-col max-h-[calc(100dvh-4rem)] overflow-hidden animate-fast animate-in zoom-in-95 fade-in z-[10000]",
                        sizeClasses[size]
                    )}
                >
                    {/* Header */}
                    <Flex align="center" justify={centerTitle ? "center" : "between"} className="px-6 py-4 border-b shrink-0 relative">
                        <Text variant="h4" weight="bold">{title}</Text>
                        <View className={cn("absolute right-4", centerTitle ? "" : "relative right-0")}>
                            <IconButton
                                icon={<span>✕</span>}
                                variant="ghost"
                                onClick={onClose}
                                className="rounded-full"
                            />
                        </View>
                    </Flex>

                    {/* Body */}
                    <View padding="lg" className="overflow-y-auto flex-1">
                        {children}
                    </View>

                    {/* Footer */}
                    {footer && (
                        <View padding="md" className="border-t bg-surface-muted/30 shrink-0">
                            {footer}
                        </View>
                    )}
                </View>
            </View>
        </Portal>
    );
}
