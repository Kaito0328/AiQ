"use client";

import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Badge } from '@/src/design/baseComponents/Badge';
import { X, Play, Trash2, Settings2 } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface SelectedCollection {
    id: string;
    name: string;
}

interface SelectionTrayProps {
    selectedCollections: SelectedCollection[];
    onRemove: (id: string) => void;
    onClear: () => void;
    onStart: () => void;
    onCancel: () => void;
}

/**
 * クイズ選択モード中に画面下部に表示される、選択済みコレクションの管理トレイです。
 */
export function SelectionTray({
    selectedCollections,
    onRemove,
    onClear,
    onStart,
    onCancel,
}: SelectionTrayProps) {
    if (selectedCollections.length === 0) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <View className="max-w-2xl mx-auto bg-surface-primary/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4">
                    <Flex justify="between" align="center">
                        <Text color="secondary" variant="xs">クイズに含めるコレクションをカードから選択してください</Text>
                        <Button variant="ghost" size="sm" onClick={onCancel} className="text-secondary hover:text-primary">
                            選択モードを終了
                        </Button>
                    </Flex>
                </View>
            </div>
        );
    }

    return (
        <View
            zIndex="sticky"
            className="fixed bottom-0 left-0 right-0 p-4 md:p-6 animate-in fade-in slide-in-from-bottom-8 duration-300"
        >
            <View className="max-w-4xl mx-auto bg-surface-primary/95 backdrop-blur-md border border-brand-primary/20 shadow-2xl rounded-2xl overflow-hidden">
                <Stack gap="none">
                    <Flex justify="between" align="center" className="px-6 py-3 bg-brand-primary/5 border-b border-brand-primary/10">
                        <Flex gap="sm" align="center">
                            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                                <Play size={16} fill="currentColor" />
                            </div>
                            <Stack gap="none">
                                <Text weight="bold" variant="detail" className="text-brand-primary">
                                    クイズの準備中
                                </Text>
                                <Text variant="xs" color="secondary" className="font-medium">
                                    {selectedCollections.length} 個のコレクションを選択済み
                                </Text>
                            </Stack>
                        </Flex>
                        <Button variant="ghost" size="sm" onClick={onCancel} className="text-secondary hover:text-brand-primary group">
                            <X size={18} className="transition-transform group-hover:rotate-90" />
                        </Button>
                    </Flex>

                    <div className="px-6 py-4 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 bg-surface-primary">
                        <Flex gap="xs" wrap>
                            {selectedCollections.map((col) => (
                                <Badge
                                    key={col.id}
                                    variant="primary"
                                    className="pl-3 pr-1 py-1 gap-1 group/badge animate-in zoom-in-95 duration-200 bg-brand-primary/10 border border-brand-primary/20"
                                >
                                    <Text variant="xs" className="max-w-[150px] truncate text-brand-primary font-bold">{col.name}</Text>
                                    <button
                                        onClick={() => onRemove(col.id)}
                                        className="p-1 rounded-full hover:bg-brand-primary/20 transition-colors text-brand-primary/60 hover:text-brand-primary"
                                        title="選択解除"
                                    >
                                        <X size={14} />
                                    </button>
                                </Badge>
                            ))}
                        </Flex>
                    </div>

                    <Flex justify="between" align="center" className="px-6 py-4 bg-surface-muted/30 border-t border-gray-100">
                        <Button variant="ghost" size="sm" onClick={onClear} className="text-status-danger hover:bg-status-danger/5 gap-2 transition-colors">
                            <Trash2 size={16} />
                            全てクリア
                        </Button>
                        <Button
                            onClick={onStart}
                            disabled={selectedCollections.length === 0}
                            className="px-8 shadow-lg shadow-brand-primary/20 gap-2 h-11"
                        >
                            <Settings2 size={18} />
                            クイズ詳細設定へ進む
                        </Button>
                    </Flex>
                </Stack>
            </View>
        </View>
    );
}
