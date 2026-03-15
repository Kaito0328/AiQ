"use client";

import React from 'react';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { FilterNode, FilterType, filterTypeLabels } from '@/src/entities/quiz';
import { Plus, X, ListFilter } from 'lucide-react';
import { Range as BaseRange } from '@/src/design/baseComponents/Range';

interface FilterBuilderProps {
    node: FilterNode | undefined;
    onChange: (node: FilterNode | undefined) => void;
    readOnly?: boolean;
}

export function FilterBuilder({ node, onChange, readOnly = false }: FilterBuilderProps) {
    // If no node exists, render nothing or a placeholder in readOnly
    if (!node) {
        if (readOnly) return <Text variant="xs" color="secondary" className="italic px-2 py-1">フィルターなし</Text>;
        return (
            <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed"
                onClick={() => onChange({ operator: 'AND', conditions: [] })}
            >
                <Plus size={16} className="mr-2" />
                フィルタを追加
            </Button>
        );
    }

    return (
        <View className="rounded-lg border border-surface-muted p-2 bg-surface-muted/10">
            <FilterNodeEditor node={node} onChange={(n) => onChange(n || undefined)} isRoot readOnly={readOnly} />
        </View>
    );
}

function FilterNodeEditor({ node, onChange, isRoot = false, readOnly = false }: { node: FilterNode, onChange: (node: FilterNode | null) => void, isRoot?: boolean, readOnly?: boolean }) {
    if (node.operator === 'CONDITION') {
        const cond = node.condition;
        const isWrongCount = cond.type === FilterType.WRONG_COUNT;

        return (
            <Flex align="center" justify="between" className="px-2 py-1.5 bg-surface-card rounded-md border border-surface-muted shadow-sm w-full gap-2">
                <Flex align="center" gap="xs" className="flex-1">
                    {isWrongCount ? (
                        <>
                            <Text variant="xs" weight="bold" className="shrink-0">{filterTypeLabels[cond.type]}:</Text>
                            <input
                                type="number"
                                min={1}
                                max={99}
                                value={cond.value === undefined || cond.value === null ? '' : cond.value}
                                readOnly={readOnly}
                                onChange={(e) => {
                                    if (readOnly) return;
                                    const valStr = e.target.value;
                                    if (valStr === '') {
                                        onChange({
                                            operator: 'CONDITION',
                                            condition: { type: FilterType.WRONG_COUNT, value: undefined as any }
                                        });
                                        return;
                                    }
                                    let val = parseInt(valStr);
                                    if (isNaN(val)) return;
                                    onChange({
                                        operator: 'CONDITION',
                                        condition: { type: FilterType.WRONG_COUNT, value: val }
                                    });
                                }}
                                className={`w-10 h-6 text-center text-[11px] border border-brand-primary/30 rounded-sm bg-surface-muted focus:outline-none focus:border-brand-primary text-foreground font-bold ${readOnly ? 'opacity-70' : ''}`}
                            />
                            <Text variant="xs" color="secondary" className="shrink-0">回以上</Text>
                        </>
                    ) : (
                        <Text variant="xs" weight="bold">{filterTypeLabels[cond.type]}</Text>
                    )}
                </Flex>
                {!readOnly && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-foreground/40 hover:text-brand-danger" onClick={() => onChange(null)}>
                        <X size={14} />
                    </Button>
                )}
            </Flex>
        );
    }

    // It's an AND or OR group
    const existsNotSolved = node.conditions.some(c => c.operator === 'CONDITION' && c.condition.type === FilterType.NOT_SOLVED);
    const existsWrongCount = node.conditions.some(c => c.operator === 'CONDITION' && c.condition.type === FilterType.WRONG_COUNT);

    return (
        <Stack gap="xs" className="w-full">
            <Flex align="center" justify="between" className="mb-1">
                <Flex align="center" gap="xs">
                    <View className={`px-2 py-0.5 rounded text-[10px] font-bold ${node.operator === 'AND' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-secondary/10 text-brand-secondary'}`}>
                        {node.operator === 'AND' ? 'すべて満たす' : 'いずれかを満たす'}
                    </View>
                </Flex>
                {!isRoot && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-foreground/50 hover:text-brand-danger" onClick={() => onChange(null)}>
                        <X size={14} />
                    </Button>
                )}
            </Flex>

            <Stack gap="xs" className="pl-3 border-l-2 border-surface-muted/50 ml-1 py-1">
                {node.conditions.map((child, idx) => (
                    <FilterNodeEditor
                        key={idx}
                        node={child}
                        readOnly={readOnly}
                        onChange={(newChild) => {
                            if (readOnly) return;
                            if (!newChild) {
                                // remove child
                                const newConds = [...node.conditions];
                                newConds.splice(idx, 1);
                                onChange({ ...node, conditions: newConds });
                            } else {
                                // update child
                                const newConds = [...node.conditions];
                                newConds[idx] = newChild;
                                onChange({ ...node, conditions: newConds });
                            }
                        }}
                    />
                ))}

                {!readOnly && (
                    <Flex gap="xs" className="mt-1 flex-wrap">
                        {!existsNotSolved && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[10px] h-6 px-1.5"
                                onClick={() => {
                                    onChange({
                                        ...node,
                                        conditions: [...node.conditions, { operator: 'CONDITION', condition: { type: FilterType.NOT_SOLVED } }]
                                    });
                                }}
                            >
                                <Plus size={10} className="mr-0.5" />
                                未解答
                            </Button>
                        )}
                        {!existsWrongCount && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[10px] h-6 px-1.5"
                                onClick={() => {
                                    onChange({
                                        ...node,
                                        conditions: [...node.conditions, { operator: 'CONDITION', condition: { type: FilterType.WRONG_COUNT, value: 1 } }]
                                    });
                                }}
                            >
                                <Plus size={10} className="mr-0.5" />
                                間違えた回数
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] h-6 px-1.5 ml-auto opacity-50 hover:opacity-100"
                            onClick={() => {
                                // Add a nested group of the OPPOSITE type
                                const newOp = node.operator === 'AND' ? 'OR' : 'AND';
                                onChange({
                                    ...node,
                                    conditions: [...node.conditions, { operator: newOp, conditions: [] }]
                                });
                            }}
                        >
                            <ListFilter size={10} className="mr-0.5" />
                            {node.operator === 'AND' ? 'ORグループ追加' : 'ANDグループ追加'}
                        </Button>
                    </Flex>
                )}
            </Stack>
        </Stack>
    );
}
