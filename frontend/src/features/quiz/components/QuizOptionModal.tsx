"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { X, SlidersHorizontal, Shuffle, ArrowDownUp, Hash, Play, Swords } from 'lucide-react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { FilterCondition, SortCondition } from '@/src/entities/quiz';
import { QuizOptions } from './QuizOptions';

interface QuizOptionModalProps {
    selectedCount: number;
    onStart: (filters: FilterCondition[], sorts: SortCondition[], limit: number) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function QuizOptionModal({ selectedCount, onStart, onCancel, loading }: QuizOptionModalProps) {
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [sorts, setSorts] = useState<SortCondition[]>([]);
    const [limit, setLimit] = useState(10);

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title="クイズ条件の設定"
            size="lg"
            footer={
                <Flex gap="sm" justify="end" className="flex-wrap">
                    <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
                        キャンセル
                    </Button>
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={() => onStart(filters, sorts, limit)}
                        disabled={loading}
                        className="gap-2 flex-1 sm:flex-none"
                    >
                        <Play size={16} fill="currentColor" />
                        {loading ? '開始中...' : 'クイズ開始'}
                    </Button>
                </Flex>
            }
        >
            <Stack gap="xl">
                <Text variant="xs" color="secondary">
                    {selectedCount} 個のコレクションが選択されています
                </Text>

                <QuizOptions
                    filters={filters}
                    sorts={sorts}
                    limit={limit}
                    onFilterChange={setFilters}
                    onSortChange={setSorts}
                    onLimitChange={setLimit}
                />
            </Stack>
        </Modal>
    );
}
