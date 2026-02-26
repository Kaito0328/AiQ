import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { View } from '../primitives/View';
import { Flex } from '../primitives/Flex';
import { Text } from '../baseComponents/Text';
import { BrandColorKey } from '../tokens/keys';

export interface ToastProps {
    message: string;
    description?: string;
    variant?: BrandColorKey;
    onClose?: () => void;
}

/**
 * 一時的な通知メッセージを表示するためのトーストコンポーネントです。
 */
export function Toast({ message, description, variant = 'primary', onClose }: ToastProps) {
    return (
        <View
            bg="card"
            shadow="lg"
            rounded="md"
            padding="md"
            className={cn(
                "border-l-4 w-[300px] animate-fast animate-in slide-in-from-right-5 fade-in",
                variant === 'primary' && "border-brand-primary",
                variant === 'secondary' && "border-brand-secondary",
                variant === 'danger' && "border-brand-danger",
                variant === 'success' && "border-brand-success",
                variant === 'warning' && "border-brand-warning",
                variant === 'info' && "border-brand-info",
                variant === 'heart' && "border-brand-heart"
            )}
        >
            <Flex justify="between" align="start">
                <View className="flex-1">
                    <Text weight="bold" color={(variant === 'heart' ? 'heart' : variant === 'danger' ? 'danger' : 'default') as any}>
                        {message}
                    </Text>
                    {description && (
                        <Text variant="detail" color="muted" className="mt-1">
                            {description}
                        </Text>
                    )}
                </View>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                    >
                        ✕
                    </button>
                )}
            </Flex>
        </View>
    );
}
