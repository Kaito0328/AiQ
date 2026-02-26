"use client";

import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { X, Play, ArrowRight, SlidersHorizontal } from 'lucide-react';

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
    isLoading?: boolean;
    disabled?: boolean;
    onOpenSettings?: () => void;
}

export function FixedSelectionTray({
    selectedCollections,
    onRemoveCollection,
    onClearAll,
    onStart,
    startLabel,
    limit,
    isLoading = false,
    disabled = false,
    onOpenSettings
}: FixedSelectionTrayProps) {
    // Note: Always visible as per user request

    return (
        <View
            zIndex="sticky"
            className="fixed bottom-0 left-0 right-0 p-4 animate-in slide-in-from-bottom-full duration-500"
        >
            <View className="max-w-6xl mx-auto bg-surface-base/80 backdrop-blur-md border-2 border-brand-primary/20 rounded-2xl shadow-2xl overflow-hidden">
                <Flex align="center" justify="between" className="p-4 md:p-6 flex-wrap md:flex-nowrap gap-6">
                    {/* Left: Selected Collections List */}
                    <Stack gap="sm" className="flex-1 min-w-[280px]">
                        <Flex justify="between" align="center">
                            <Flex align="center" gap="sm">
                                <View className="p-1 px-2 bg-brand-primary text-white text-[10px] font-bold rounded uppercase tracking-wider">
                                    SELECTED
                                </View>
                                <Text variant="xs" weight="bold">
                                    {selectedCollections.length} 個のコレクションを選択中
                                </Text>
                            </Flex>
                            {selectedCollections.length > 0 && (
                                <Stack align="end" gap="none">
                                    <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-[10px] text-secondary hover:text-brand-danger">
                                        全てクリア
                                    </Button>
                                    {typeof limit === 'number' && (
                                        <Text variant="xs" weight="bold" color="primary" className="mr-2">
                                            現在の問題数: {limit}問
                                        </Text>
                                    )}
                                </Stack>
                            )}
                        </Flex>

                        {selectedCollections.length > 0 ? (
                            <Flex gap="xs" className="flex-wrap max-h-24 overflow-y-auto no-scrollbar p-1">
                                {selectedCollections.map(c => (
                                    <View
                                        key={c.id}
                                        className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full flex items-center gap-2 group transition-colors hover:bg-brand-primary/20"
                                    >
                                        <Text variant="xs" weight="bold" color="primary" className="max-w-[150px] truncate">{c.name}</Text>
                                        <View
                                            className="cursor-pointer text-brand-primary hover:text-brand-danger transition-colors"
                                            onClick={() => onRemoveCollection(c.id)}
                                        >
                                            <X size={12} strokeWidth={3} />
                                        </View>
                                    </View>
                                ))}
                            </Flex>
                        ) : (
                            <View className="p-3 border-2 border-dashed border-surface-muted/30 rounded-xl bg-surface-muted/5 w-full">
                                <Text variant="xs" color="secondary" className="italic opacity-60">
                                    上のブラウザからクイズに使用する問題集を選択してください
                                </Text>
                            </View>
                        )}
                    </Stack>

                    {/* Right: Actions */}
                    <Flex gap="md" align="center" className="shrink-0 w-full md:w-auto">
                        {onOpenSettings && (
                            <Button
                                variant="outline"
                                color="primary"
                                size="lg"
                                className="px-5 py-6 bg-surface-base"
                                onClick={onOpenSettings}
                                title="詳細設定"
                            >
                                <SlidersHorizontal size={20} />
                                <Text variant="detail" weight="bold" className="hidden sm:inline ml-2">詳細設定</Text>
                            </Button>
                        )}
                        <Button
                            variant="solid"
                            color="primary"
                            size="lg"
                            className="flex-1 md:flex-none px-8 py-6 text-base font-bold shadow-xl shadow-brand-primary/20 gap-3 group transition-transform active:scale-95"
                            onClick={onStart}
                            disabled={disabled || isLoading || selectedCollections.length === 0}
                        >
                            {isLoading ? (
                                <View className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Play size={20} fill="currentColor" />
                            )}
                            {startLabel}
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Flex>
                </Flex>
            </View>
        </View>
    );
}
