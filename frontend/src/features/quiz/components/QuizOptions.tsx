"use client";

import React from 'react';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { Shuffle, ArrowDownUp, Hash, BookOpen } from 'lucide-react';
import { Range as BaseRange } from '@/src/design/baseComponents/Range';
import {
    FilterType,
    SortKey,
    FilterCondition,
    SortCondition,
    filterTypeLabels,
    sortKeyLabels,
} from '@/src/entities/quiz';

interface QuizOptionsProps {
    filters: FilterCondition[];
    sorts: SortCondition[];
    limit: number;
    maxLimit?: number;
    onFilterChange: (filters: FilterCondition[]) => void;
    onSortChange: (sorts: SortCondition[]) => void;
    onLimitChange: (limit: number) => void;
    compact?: boolean;
}

export function QuizOptions({
    filters,
    sorts,
    limit,
    maxLimit = 50,
    onFilterChange,
    onSortChange,
    onLimitChange,
    compact = false,
}: QuizOptionsProps) {
    const toggleFilter = (type: FilterType) => {
        const exists = filters.find(f => f.type === type);
        if (exists) {
            onFilterChange(filters.filter(f => f.type !== type));
        } else {
            onFilterChange([...filters, { type }]);
        }
    };

    const toggleSort = (key: SortKey) => {
        const exists = sorts.find(s => s.key === key);
        if (exists) {
            onSortChange(sorts.filter(s => s.key !== key));
        } else {
            onSortChange([...sorts, { key }]);
        }
    };

    return (
        <Stack gap={compact ? "md" : "xl"}>
            {/* フィルター */}
            <Stack gap="sm">
                <Flex gap="xs" align="center">
                    <Shuffle size={16} className="text-foreground/60" />
                    <Text variant="detail" weight="bold">フィルター</Text>
                </Flex>
                <Flex gap="sm" className="flex-wrap">
                    {Object.entries(filterTypeLabels).map(([key, label]) => {
                        const isActive = filters.some(f => f.type === key);
                        return (
                            <Button
                                key={key}
                                variant={isActive ? "solid" : "outline"}
                                color={isActive ? "primary" : undefined}
                                size="sm"
                                onClick={() => toggleFilter(key as FilterType)}
                            >
                                {label}
                            </Button>
                        );
                    })}
                </Flex>
            </Stack>

            {/* ソート */}
            <Stack gap="sm">
                <Flex gap="xs" align="center">
                    <ArrowDownUp size={16} className="text-foreground/60" />
                    <Text variant="detail" weight="bold">ソート</Text>
                </Flex>
                <Flex gap="sm" className="flex-wrap">
                    {Object.entries(sortKeyLabels).map(([key, label]) => {
                        const isActive = sorts.some(s => s.key === key);
                        return (
                            <Button
                                key={key}
                                variant={isActive ? "solid" : "outline"}
                                color={isActive ? "primary" : undefined}
                                size="sm"
                                onClick={() => toggleSort(key as SortKey)}
                            >
                                {label}
                            </Button>
                        );
                    })}
                </Flex>
            </Stack>

            {/* 問題数 */}
            <Stack gap="sm">
                <Flex justify="between" align="center">
                    <Flex gap="xs" align="center">
                        <Hash size={16} className="text-foreground/60" />
                        <Text variant="detail" weight="bold">問題数</Text>
                    </Flex>
                    <Text variant="detail" weight="bold">{limit}問</Text>
                </Flex>
                <View className="px-2">
                    <BaseRange
                        min={1}
                        max={maxLimit}
                        value={Math.min(limit, maxLimit)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLimitChange(parseInt(e.target.value))}
                    />
                    <Flex justify="between" className="mt-1">
                        <Text variant="xs" color="secondary">1</Text>
                        <Text variant="xs" color="secondary">{maxLimit}</Text>
                    </Flex>
                </View>
            </Stack>
        </Stack>
    );
}
