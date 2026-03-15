"use client";

import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { WifiOff, CloudOff } from 'lucide-react';
import { Button } from '@/src/design/baseComponents/Button';

interface OfflinePlaceholderProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    showRetry?: boolean;
}

/**
 * オフライン状態によりコンテンツが表示できない場合に使用するプレースホルダーです。
 */
export const OfflinePlaceholder: React.FC<OfflinePlaceholderProps> = ({
    title = "オフラインモード",
    message = "現在オフラインのため、このデータは表示できません。オンラインに戻ってから再度お試しください。",
    onRetry,
    showRetry = true
}) => {
    return (
        <View className="py-12 px-6 flex flex-col items-center justify-center text-center bg-surface-base/50 rounded-xl border border-dashed border-surface-muted">
            <Stack gap="md" align="center">
                <View className="p-4 bg-amber-500/10 rounded-full text-amber-500 mb-2">
                    <WifiOff size={40} />
                </View>
                <Text variant="h4" weight="bold">{title}</Text>
                <Text color="secondary" className="max-w-md">
                    {message}
                </Text>
                {showRetry && onRetry && (
                    <Button variant="outline" size="md" onClick={onRetry} className="mt-2">
                        再読み込み
                    </Button>
                )}
            </Stack>
        </View>
    );
};
