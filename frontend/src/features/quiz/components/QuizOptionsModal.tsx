"use client";

import React from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { QuizOptions } from './QuizOptions';
import { FilterCondition, SortCondition } from '@/src/entities/quiz';
import { Button } from '@/src/design/baseComponents/Button';
import { Flex } from '@/src/design/primitives/Flex';

interface QuizOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterCondition[];
    sorts: SortCondition[];
    limit: number;
    maxLimit: number;
    onFilterChange: (filters: FilterCondition[]) => void;
    onSortChange: (sorts: SortCondition[]) => void;
    onLimitChange: (limit: number) => void;
}

export function QuizOptionsModal({
    isOpen,
    onClose,
    filters,
    sorts,
    limit,
    maxLimit,
    onFilterChange,
    onSortChange,
    onLimitChange,
}: QuizOptionsModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="出題設定"
            size="md"
            footer={
                <Flex justify="end">
                    <Button variant="solid" color="primary" onClick={onClose}>
                        閉じる
                    </Button>
                </Flex>
            }
        >
            <QuizOptions
                filters={filters}
                sorts={sorts}
                limit={limit}
                maxLimit={maxLimit}
                onFilterChange={onFilterChange}
                onSortChange={onSortChange}
                onLimitChange={onLimitChange}
            />
        </Modal>
    );
}
