"use client";

import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { X, Play, ArrowRight } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { Range as BaseRange } from '@/src/design/baseComponents/Range';

interface SelectedCollection {
    id: string;
    name: string;
    questionCount: number;
}

interface FixedSelectionTrayProps {
    selectedCollections: SelectedCollection[];
    onRemoveCollection: (id: string) => void;
    onClearAll: () => void;
    onStart: () => void;
    startLabel: string;
    limit?: number;
    maxLimit?: number;
    onLimitChange?: (limit: number) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

export function FixedSelectionTray({
    selectedCollections,
    onRemoveCollection,
    onClearAll,
    onStart,
    startLabel,
    limit,
    maxLimit,
    onLimitChange,
    isLoading = false,
    disabled = false,
}: FixedSelectionTrayProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <View
            zIndex="sticky"
            className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 animate-in slide-in-from-bottom-full duration-500"
        >
            <View className="max-w-6xl mx-auto bg-surface-card/95 backdrop-blur-xl border-2 border-brand-primary/20 rounded-2xl shadow-2xl overflow-hidden">
                <Flex direction="column" className="w-full">
                    {/* Header Summary (Always Visible) */}
                    <View className="p-3 sm:p-5 pb-1 sm:pb-3 bg-surface-card/50">
                        <Stack gap="xs" className="w-full">
                            <Flex align="center" justify="between">
                                <Flex align="center" gap="sm">
                                    <View className="p-1 px-2 bg-brand-primary text-white text-[9px] font-bold rounded uppercase tracking-wider">
                                        SELECTED
                                    </View>
                                    <Text variant="xs" weight="bold" color="primary" className="brightness-75 dark:brightness-100">
                                        {selectedCollections.length} 個のコレクションを選択中
                                    </Text>
                                </Flex>
                                {selectedCollections.length > 0 && (
                                    <View
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="text-[10px] text-brand-primary font-bold hover:underline sm:hidden cursor-pointer"
                                    >
                                        {isExpanded ? '詳細を閉じる' : '詳細を表示'}
                                    </View>
                                )}
                            </Flex>
                        </Stack>
                    </View>

                    {/* Expandable Content (List of Collections) - MOVED ABOVE ACTION BUTTON */}
                    <View className={cn(
                        "transition-all duration-300 overflow-hidden bg-surface-muted/50 dark:bg-white/5",
                        isExpanded || "hidden sm:block",
                        isExpanded ? "max-h-[400px] border-y border-surface-muted/50 p-4" : "max-h-0 sm:max-h-[140px] sm:p-4 sm:pt-0"
                    )}>
                        <Stack gap="sm">
                            <Flex justify="between" align="center">
                                <Text variant="xs" weight="bold" color="secondary" className="hidden sm:block opacity-60">選択中のリスト</Text>
                                {selectedCollections.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-[10px] text-secondary hover:text-brand-danger">
                                        全てクリア
                                    </Button>
                                )}
                            </Flex>
                            <Flex gap="xs" className="flex-wrap max-h-32 overflow-y-auto no-scrollbar p-1">
                                {selectedCollections.map(c => (
                                    <View
                                        key={c.id}
                                        className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full flex items-center gap-2 group transition-colors hover:bg-brand-primary/20"
                                    >
                                        <Text variant="xs" weight="bold" color="primary" className="max-w-[120px] sm:max-w-[200px] truncate">{c.name}</Text>
                                        <View
                                            className="cursor-pointer text-brand-primary hover:text-brand-danger transition-colors"
                                            onClick={() => onRemoveCollection(c.id)}
                                        >
                                            <X size={12} strokeWidth={3} />
                                        </View>
                                    </View>
                                ))}
                            </Flex>
                        </Stack>

                    </View>

                    <View className="p-3 sm:p-5 pt-0 sm:pt-0">
                        <Flex direction="column" gap="md" align="stretch" justify="between" className="md:flex-row md:items-center">
                            {/* 問題数スライダー (常時表示) */}
                            {selectedCollections.length > 0 && limit !== undefined && maxLimit !== undefined && onLimitChange && (
                                <Stack gap="xs" className="flex-1 min-w-[200px] max-w-sm">
                                    <Flex justify="between" align="center">
                                        <Text variant="xs" weight="bold" color="secondary">問題数</Text>
                                        <Text variant="detail" weight="bold" color="primary">{limit}問</Text>
                                    </Flex>
                                    <View className="px-1">
                                        <BaseRange
                                            min={1}
                                            max={Math.max(1, maxLimit)}
                                            value={Math.min(limit, maxLimit)}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLimitChange(parseInt(e.target.value))}
                                            enableJumpTap={true}
                                        />
                                    </View>
                                </Stack>
                            )}

                            <Button
                                variant="solid"
                                color="primary"
                                size="md"
                                className="px-6 py-5 text-sm font-bold shadow-lg shadow-brand-primary/20 gap-2 group transition-transform active:scale-95 h-12 md:h-10 mt-2 md:mt-0"
                                onClick={onStart}
                                disabled={disabled || isLoading || selectedCollections.length === 0}
                            >
                                {isLoading ? (
                                    <View className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Play size={16} fill="currentColor" />
                                )}
                                {startLabel}
                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Flex>
                    </View>
                </Flex>
            </View>
        </View>
    );
}
