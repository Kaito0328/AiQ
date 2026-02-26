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
export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
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
                zIndex="overlay"
                className="fixed inset-0 flex items-center justify-center p-4"
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
                    zIndex="modal"
                    className={cn(
                        "relative w-full overflow-hidden animate-fast animate-in zoom-in-95 fade-in",
                        sizeClasses[size]
                    )}
                >
                    {/* Header */}
                    <Flex align="center" justify="between" className="px-6 py-4 border-b">
                        <Text variant="h4" weight="bold">{title}</Text>
                        <IconButton
                            icon={<span>✕</span>}
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-full"
                        />
                    </Flex>

                    {/* Body */}
                    <View padding="lg" className="max-h-[70vh] overflow-y-auto">
                        {children}
                    </View>

                    {/* Footer */}
                    {footer && (
                        <View padding="md" className="border-t bg-surface-muted/30">
                            {footer}
                        </View>
                    )}
                </View>
            </View>
        </Portal>
    );
}
