"use client";

import React from 'react';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { Settings2, Shuffle, ArrowDownUp, Hash, BookOpen, Plus, Clock, Award, Zap, X } from 'lucide-react';
import { Range as BaseRange } from '@/src/design/baseComponents/Range';
import {
    FilterType,
    SortKey,
    FilterCondition,
    SortCondition,
    FilterNode,
    QuizMode,
    filterTypeLabels,
    sortKeyLabels,
    SortDirection,
} from '@/src/entities/quiz';
import { MatchConfig } from '@/src/entities/battle';
import { FilterBuilder } from './FilterBuilder';
import { cn } from '@/src/shared/utils/cn';

interface QuizOptionsProps {
    filterNode: FilterNode | undefined;
    onFilterNodeChange: (node: FilterNode | undefined) => void;
    sorts: SortCondition[];
    onSortChange: (sorts: SortCondition[]) => void;
    limit: number;
    maxLimit?: number;
    onLimitChange: (limit: number) => void;
    preferredMode: QuizMode;
    onModeChange: (mode: QuizMode) => void;
    dummyCharCount: number;
    onDummyCountChange: (count: number) => void;
    compact?: boolean;
    matchConfig?: MatchConfig;
    onMatchConfigChange?: (config: MatchConfig) => void;
    hideFuzzy?: boolean;
    hideMatchConfig?: boolean;
    hideLimit?: boolean;
    readOnly?: boolean;
}

export function QuizOptions({
    filterNode,
    onFilterNodeChange,
    sorts,
    limit,
    maxLimit = 50,
    onLimitChange,
    onSortChange,
    preferredMode,
    onModeChange,
    dummyCharCount,
    onDummyCountChange,
    compact = false,
    matchConfig,
    onMatchConfigChange,
    hideFuzzy = false,
    hideMatchConfig = false,
    hideLimit = false,
    readOnly = false,
}: QuizOptionsProps) {

    const toggleSort = (key: SortKey) => {
        if (readOnly) return;
        const existing = sorts.find(s => s.key === key);
        if (existing) {
            // If already active, toggle direction or remove
            if (existing.direction === SortDirection.ASC) {
                onSortChange(sorts.map(s => s.key === key ? { ...s, direction: SortDirection.DESC } : s));
            } else {
                onSortChange(sorts.map(s => s.key === key ? { ...s, direction: SortDirection.ASC } : s));
            }
        } else {
            // New sort being added
            if (key === SortKey.RANDOM) {
                // Clicking RANDOM cleared everything else
                onSortChange([{ key: SortKey.RANDOM, direction: SortDirection.ASC }]);
            } else {
                // If adding a normal sort, remove RANDOM if it exists
                const filtered = sorts.filter(s => s.key !== SortKey.RANDOM);
                onSortChange([...filtered, { key, direction: SortDirection.ASC }]);
            }
        }
    };

    // Helper to completely remove a sort instead of toggling direction
    const removeSort = (key: SortKey) => {
        if (readOnly) return;
        onSortChange(sorts.filter(s => s.key !== key));
    };

    const updateMatchConfig = (updates: Partial<MatchConfig>) => {
        if (readOnly) return;
        if (matchConfig && onMatchConfigChange) {
            onMatchConfigChange({ ...matchConfig, ...updates });
        }
    };

    return (
        <Stack gap={compact ? "md" : "xl"}>
            {/* 入力モード */}
            <Stack gap="sm">
                <Flex gap="xs" align="center">
                    <BookOpen size={16} className="text-foreground/60" />
                    <Text variant="detail" weight="bold">入力モード</Text>
                </Flex>
                <Flex gap="sm" className="flex-wrap">
                    {[
                        { id: 'text', label: 'テキスト' },
                        { id: 'fourChoice', label: '4択' },
                        { id: 'chips', label: 'チップ' },
                    ].map((m) => {
                        const isActive = preferredMode === m.id || (m.id === 'text' && preferredMode === 'fuzzy');
                        return (
                            <Button
                                key={m.id}
                                variant={isActive ? "solid" : "outline"}
                                color={isActive ? "primary" : undefined}
                                size="sm"
                                onClick={readOnly ? undefined : () => onModeChange(m.id as QuizMode)}
                                disabled={readOnly}
                            >
                                {m.label}
                            </Button>
                        );
                    })}
                </Flex>

                {/* Fuzzy toggle — shown only when text (or fuzzy) is the input mode */}
                {!hideFuzzy && (preferredMode === 'text' || preferredMode === 'fuzzy') && (
                    <>
                        <Text variant="xs" color="secondary" className="px-1">
                            ※ データの不足している問題は自動的にテキスト入力に切り替わります
                        </Text>

                        <Flex
                            gap="sm"
                            align="center"
                            className={cn(
                                "mt-1 p-2.5 rounded-lg bg-surface-muted/40 border border-surface-muted",
                                readOnly ? "cursor-default" : "cursor-pointer"
                            )}
                            onClick={readOnly ? undefined : () => onModeChange(preferredMode === 'fuzzy' ? 'text' : 'fuzzy')}
                        >
                            {/* Toggle pill */}
                            <View className={cn(
                                "relative w-9 h-5 rounded-full transition-colors shrink-0 border",
                                preferredMode === 'fuzzy' ? 'bg-brand-primary border-brand-primary' : 'bg-gray-200 border-gray-300',
                                readOnly && "opacity-60"
                            )}>
                                <View className={cn(
                                    "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all",
                                    preferredMode === 'fuzzy' ? 'left-[18px]' : 'left-0.5'
                                )} />
                            </View>
                            <Stack gap="none">
                                <Text variant="xs" weight="bold">大体正解AIモード</Text>
                                <Text variant="xs" color="secondary">
                                    {preferredMode === 'fuzzy'
                                        ? '初回のみモデル（約90MB）をクイズ開始時にダウンロードします。'
                                        : '略称やひらがな入力などのゆれをAIが許容して正解にします。'}
                                </Text>
                            </Stack>
                        </Flex>
                    </>
                )}

                {/* Note for non-text modes */}
                {preferredMode !== 'text' && preferredMode !== 'fuzzy' && (
                    <Text variant="xs" color="secondary" className="px-1">
                        ※ データの不足している問題は自動的にテキスト入力に切り替わります
                    </Text>
                )}

                {/* ダミー文字数 (チップモード時のみ) */}
                {preferredMode === 'chips' && (
                    <Stack gap="sm" className="animate-in fade-in slide-in-from-top-1 duration-300 mt-2">
                        <Flex justify="between" align="center">
                            <Flex gap="xs" align="center">
                                <Plus size={16} className="text-foreground/60" />
                                <Text variant="detail" weight="bold">ダミーチップ数</Text>
                            </Flex>
                            <Text variant="detail" weight="bold">{dummyCharCount}個</Text>
                        </Flex>
                        <View className="px-2">
                            <BaseRange
                                min={0}
                                max={12}
                                value={dummyCharCount}
                                disabled={readOnly}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDummyCountChange(parseInt(e.target.value))}
                            />
                            <Flex justify="between" className="mt-1">
                                <Text variant="xs" color="secondary">0</Text>
                                <Text variant="xs" color="secondary">12</Text>
                            </Flex>
                        </View>
                    </Stack>
                )}
            </Stack>

            {/* 問題数 */}
            {!hideLimit && (
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
                            disabled={readOnly}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLimitChange(parseInt(e.target.value))}
                        />
                        <Flex justify="between" className="mt-1">
                            <Text variant="xs" color="secondary">1</Text>
                            <Text variant="xs" color="secondary">{maxLimit}</Text>
                        </Flex>
                    </View>
                </Stack>
            )}

            {/* フィルター */}
            <Stack gap="sm">
                <Flex gap="xs" align="center">
                    <Shuffle size={16} className="text-foreground/60" />
                    <Text variant="detail" weight="bold">フィルター</Text>
                </Flex>
                <FilterBuilder node={filterNode} onChange={onFilterNodeChange} readOnly={readOnly} />
            </Stack>

            {/* ソート */}
            <Stack gap="sm">
                <Flex gap="sm" align="center" justify="between">
                    <Flex gap="xs" align="center">
                        <ArrowDownUp size={16} className="text-foreground/60" />
                        <Text variant="detail" weight="bold">ソート</Text>
                    </Flex>
                    {(() => {
                        const isRandom = sorts.some(s => s.key === SortKey.RANDOM);
                        return (
                            <Button
                                variant={isRandom ? "solid" : "outline"}
                                color={isRandom ? "primary" : undefined}
                                size="sm"
                                onClick={() => toggleSort(SortKey.RANDOM)}
                                disabled={readOnly}
                                className="gap-1 px-2 h-7"
                            >
                                <Shuffle size={12} />
                                <span className="text-[10px] font-bold">{sortKeyLabels[SortKey.RANDOM]}</span>
                            </Button>
                        );
                    })()}
                </Flex>

                <Flex gap="sm" className="flex-wrap">
                    {Object.entries(sortKeyLabels).filter(([k]) => k !== SortKey.RANDOM).map(([key, label]) => {
                        const _key = key as SortKey;
                        const activeIndex = sorts.findIndex(s => s.key === _key);
                        const isActive = activeIndex !== -1;
                        const activeSort = isActive ? sorts[activeIndex] : null;

                        // 有効なソートの適用順位を計算 (ランダムは除外されている)
                        const activeSortsOrdered = sorts.filter(s => s.key !== SortKey.RANDOM);
                        const sortRank = activeSortsOrdered.findIndex(s => s.key === _key) + 1;

                        return (
                            <Flex key={key} className="relative group mt-1">
                                {isActive && activeSortsOrdered.length > 1 && (
                                    <View className="absolute -top-1.5 -left-1.5 bg-brand-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full z-10 font-bold shadow-sm">
                                        {sortRank}
                                    </View>
                                )}
                                <Button
                                    variant={isActive ? "solid" : "outline"}
                                    color={isActive ? "primary" : undefined}
                                    size="sm"
                                    onClick={() => toggleSort(_key)}
                                    disabled={readOnly}
                                    className={isActive ? "pr-8" : ""}
                                >
                                    {label}
                                    {isActive && activeSort?.direction && (
                                        <Text variant="xs" className="ml-1 opacity-70">
                                            ({activeSort.direction === SortDirection.ASC ? '昇順' : '降順'})
                                        </Text>
                                    )}
                                </Button>
                                {isActive && (
                                    <View
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/10 hover:bg-black/20 text-white cursor-pointer"
                                        onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            removeSort(_key);
                                        }}
                                    >
                                        <X size={12} />
                                    </View>
                                )}
                            </Flex>
                        );
                    })}
                </Flex>
            </Stack>



            {/* バトル詳細設定 */}
            {!hideMatchConfig && matchConfig && onMatchConfigChange && (
                <Stack gap="lg" className="pt-6 border-t border-surface-muted/50">
                    <Flex gap="xs" align="center">
                        <Settings2 size={16} className="text-brand-primary" />
                        <Text variant="detail" weight="bold" color="primary">バトル詳細設定</Text>
                    </Flex>

                    <Stack gap="md">
                        {/* Timers */}
                        <Stack gap="xs">
                            <Flex justify="between" align="center">
                                <Flex gap="xs" align="center">
                                    <Clock size={14} className="text-secondary" />
                                    <Text variant="xs" weight="bold">テキスト入力タイマー</Text>
                                </Flex>
                                <Text variant="xs" weight="bold">{matchConfig.text_timer_s}s</Text>
                            </Flex>
                            <BaseRange
                                min={5}
                                max={60}
                                step={1}
                                value={matchConfig.text_timer_s}
                                onChange={(e) => updateMatchConfig({ text_timer_s: parseInt(e.target.value) })}
                                disabled={readOnly}
                            />
                        </Stack>

                        <Stack gap="xs">
                            <Flex justify="between" align="center">
                                <Flex gap="xs" align="center">
                                    <Clock size={14} className="text-secondary" />
                                    <Text variant="xs" weight="bold">チップ1文字タイマー</Text>
                                </Flex>
                                <Text variant="xs" weight="bold">{matchConfig.chips_char_timer_s}s</Text>
                            </Flex>
                            <BaseRange
                                min={1}
                                max={15}
                                step={1}
                                value={matchConfig.chips_char_timer_s}
                                onChange={(e) => updateMatchConfig({ chips_char_timer_s: parseInt(e.target.value) })}
                                disabled={readOnly}
                            />
                        </Stack>

                        {/* Scores */}
                        <Stack gap="xs">
                            <Flex justify="between" align="center">
                                <Flex gap="xs" align="center">
                                    <Award size={14} className="text-secondary" />
                                    <Text variant="xs" weight="bold">基本スコア</Text>
                                </Flex>
                                <Text variant="xs" weight="bold">{matchConfig.base_score}pts</Text>
                            </Flex>
                            <BaseRange
                                min={0}
                                max={1000}
                                step={10}
                                value={matchConfig.base_score}
                                onChange={(e) => updateMatchConfig({ base_score: parseInt(e.target.value) })}
                                disabled={readOnly}
                            />
                        </Stack>

                        <Stack gap="xs">
                            <Flex justify="between" align="center">
                                <Flex gap="xs" align="center">
                                    <Zap size={14} className="text-secondary" />
                                    <Text variant="xs" weight="bold">最大スピードボーナス</Text>
                                </Flex>
                                <Text variant="xs" weight="bold">{matchConfig.speed_bonus_max}pts</Text>
                            </Flex>
                            <BaseRange
                                min={0}
                                max={500}
                                step={10}
                                value={matchConfig.speed_bonus_max}
                                onChange={(e) => updateMatchConfig({ speed_bonus_max: parseInt(e.target.value) })}
                                disabled={readOnly}
                            />
                        </Stack>

                        <Stack gap="xs">
                            <Flex justify="between" align="center">
                                <Flex gap="xs" align="center">
                                    <X size={14} className="text-brand-danger" />
                                    <Text variant="xs" weight="bold" color="danger">誤答ペナルティ</Text>
                                </Flex>
                                <Text variant="xs" weight="bold" color="danger">-{matchConfig.penalty}pts</Text>
                            </Flex>
                            <BaseRange
                                min={0}
                                max={200}
                                step={5}
                                value={matchConfig.penalty}
                                onChange={(e) => updateMatchConfig({ penalty: parseInt(e.target.value) })}
                                disabled={readOnly}
                            />
                        </Stack>
                    </Stack>
                </Stack>
            )
            }
        </Stack >
    );
}
