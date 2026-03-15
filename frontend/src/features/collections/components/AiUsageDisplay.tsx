import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { useAiUsage } from '../hooks/useAiUsage';
import { Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

export function AiUsageDisplay({ className }: { className?: string }) {
    const { usage, isLoading } = useAiUsage();

    if (isLoading || !usage) {
        return (
            <View className={cn("p-4 bg-surface-muted/30 rounded-xl animate-pulse", className)}>
                <View className="h-4 w-24 bg-surface-muted rounded mb-2" />
                <View className="h-2 w-full bg-surface-muted rounded-full" />
            </View>
        );
    }

    if (usage.isExempt) {
        return (
            <Flex
                align="center"
                gap="sm"
                className={cn("p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl", className)}
            >
                <ShieldCheck size={20} className="text-brand-primary" />
                <Stack gap="none">
                    <Text variant="xs" weight="bold" className="text-brand-primary">AI無制限モード</Text>
                    <Text variant="xs" color="secondary">あなたは制限の対象外です</Text>
                </Stack>
            </Flex>
        );
    }

    const percentage = Math.min(100, (usage.unitsUsed / usage.dailyLimit) * 100);
    const isWarning = percentage > 80;
    const isCritical = percentage > 95;

    return (
        <View className={cn("p-4 bg-surface-muted/20 border border-surface-muted rounded-xl", className)}>
            <Stack gap="sm">
                <Flex justify="between" align="center">
                    <Flex gap="xs" align="center">
                        <Zap size={16} className={isCritical ? "text-brand-danger" : isWarning ? "text-status-warning" : "text-brand-primary"} />
                        <Text variant="xs" weight="bold">本日のAI利用状況</Text>
                    </Flex>
                    <Text variant="xs" weight="bold" color={isCritical ? "danger" : "secondary"}>
                        {usage.unitsUsed.toFixed(1)} / {usage.dailyLimit.toFixed(0)} units
                    </Text>
                </Flex>
                <View className="h-2 bg-surface-muted rounded-full overflow-hidden">
                    <View
                        className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            isCritical ? "bg-brand-danger" : isWarning ? "bg-status-warning" : "bg-brand-primary"
                        )}
                        style={{ width: `${percentage}%` }}
                    />
                </View>
                <Text variant="xs" color="secondary" className="mt-1">
                    毎日 00:00 (UTC) 頃にリセットされます
                </Text>
            </Stack>
        </View>
    );
}
