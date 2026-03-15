"use client";

import React from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { QuizOptions } from './QuizOptions';
import { SortCondition, QuizMode, FilterNode } from '@/src/entities/quiz';
import { Button } from '@/src/design/baseComponents/Button';
import { Flex } from '@/src/design/primitives/Flex';
import { MatchConfig } from '@/src/entities/battle';
import { View } from '@/src/design/primitives/View';

interface QuizOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    filterNode: FilterNode | undefined;
    sorts: SortCondition[];
    limit: number;
    maxLimit: number;
    isLoading?: boolean;
    onFilterNodeChange: (node: FilterNode | undefined) => void;
    onSortChange: (sorts: SortCondition[]) => void;
    onLimitChange: (limit: number) => void;
    preferredMode: QuizMode;
    onModeChange: (mode: QuizMode) => void;
    dummyCharCount: number;
    onDummyCountChange: (count: number) => void;
    onStart?: () => void;
    matchConfig?: MatchConfig;
    onMatchConfigChange?: (config: MatchConfig) => void;
    hideFuzzy?: boolean;
    hideMatchConfig?: boolean;
    hideLimit?: boolean;
    readOnly?: boolean;
    isOffline?: boolean;
}

export function QuizOptionsModal({
    isOpen,
    onClose,
    filterNode,
    sorts,
    limit,
    maxLimit,
    isLoading = false,
    onFilterNodeChange,
    onSortChange,
    onLimitChange,
    preferredMode,
    onModeChange,
    dummyCharCount,
    onDummyCountChange,
    matchConfig,
    onMatchConfigChange,
    hideFuzzy = false,
    hideMatchConfig = false,
    hideLimit = false,
    onStart,
    readOnly = false,
    isOffline = false,
}: QuizOptionsModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={readOnly ? "出題設定 (表示のみ)" : "出題設定"}
            size="md"
            footer={
                <Flex justify="center" gap="sm" className="w-full">
                    {readOnly ? (
                        <Button variant="solid" color="primary" onClick={onClose} className="px-12">
                            閉じる
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                                キャンセル
                            </Button>
                            <Button
                                variant="solid"
                                color="primary"
                                onClick={onStart ? onStart : onClose}
                                loading={isLoading}
                                className="px-8 gap-2"
                            >
                                適用する
                            </Button>
                        </>
                    )}
                </Flex>
            }
        >
            <View className="p-3 sm:p-4 pb-6">
                <QuizOptions
                    filterNode={filterNode}
                    sorts={sorts}
                    limit={limit}
                    maxLimit={maxLimit}
                    onFilterNodeChange={onFilterNodeChange}
                    onSortChange={onSortChange}
                    onLimitChange={onLimitChange}
                    preferredMode={preferredMode}
                    onModeChange={onModeChange}
                    dummyCharCount={dummyCharCount}
                    onDummyCountChange={onDummyCountChange}
                    matchConfig={matchConfig}
                    onMatchConfigChange={onMatchConfigChange}
                    hideFuzzy={hideFuzzy}
                    hideMatchConfig={hideMatchConfig}
                    hideLimit={hideLimit}
                    readOnly={readOnly}
                    isOffline={isOffline}
                />
            </View>
        </Modal>
    );
}
