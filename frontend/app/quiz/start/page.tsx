"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { CollectionBrowser } from '@/src/features/collections/components/CollectionBrowser';
import { FixedSelectionTray } from '@/src/features/collections/components/FixedSelectionTray';
import { startCasualQuiz } from '@/src/features/quiz/api';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { FilterCondition, SortCondition } from '@/src/entities/quiz';
import { QuizOptionsModal } from '@/src/features/quiz/components/QuizOptionsModal';
import { Card } from '@/src/design/baseComponents/Card';
import { Flex } from '@/src/design/primitives/Flex';
import { Library } from 'lucide-react';
import { AddToSetModal } from '@/src/features/collectionSets/components/AddToSetModal';

export default function QuizStartPage() {
    const router = useRouter();
    const [selectedCollections, setSelectedCollections] = useState<{ id: string, name: string, questionCount: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Quiz options state
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [sorts, setSortCondition] = useState<SortCondition[]>([]);
    const [limit, setLimit] = useState(0);
    const [isManualLimit, setIsManualLimit] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Add to set state
    const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
    const [isAddToSetModalOpen, setIsAddToSetModalOpen] = useState(false);

    const totalQuestions = selectedCollections.reduce((sum, c) => sum + (c.questionCount || 0), 0);

    const handleToggleCollection = (id: string, name: string, count?: number) => {
        setSelectedCollections(prev => {
            const isRemoving = prev.some(c => c.id === id);
            const next = isRemoving
                ? prev.filter(c => c.id !== id)
                : [...prev, { id, name, questionCount: count || 0 }];

            // Smart Limit: If not manually adjusted, sync with total
            if (!isManualLimit) {
                const newTotal = next.reduce((sum, c) => sum + (c.questionCount || 0), 0);
                setLimit(newTotal);
            }

            return next;
        });
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setIsManualLimit(true);
    };

    const handleOpenAddToSet = (id: string) => {
        setTargetCollectionId(id);
        setIsAddToSetModalOpen(true);
    };

    const handleStartQuiz = async () => {
        if (selectedCollections.length === 0) return;

        setIsLoading(true);
        try {
            const resp = await startCasualQuiz({
                collectionIds: selectedCollections.map(c => c.id),
                filters,
                sorts,
                limit
            });
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('quizData', JSON.stringify(resp));
            }
            router.push('/quiz');
        } catch (err) {
            console.error('Failed to start quiz', err);
            alert('クイズの開始に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="min-h-screen bg-surface-muted pb-40">
            <BackButton />
            <Container className="pt-20">
                <Stack gap="xl">
                    <Stack gap="xs">
                        <Text variant="h2" weight="bold">クイズをカスタマイズ</Text>
                        <Text color="secondary">好きな問題集をいくつか選んで、自分だけのクイズセットを作成しましょう</Text>
                    </Stack>

                    <Stack gap="lg">
                        {/* セレクター */}
                        <Card padding="none" className="border border-surface-muted shadow-xl overflow-hidden bg-surface-base">
                            <View className="p-6 border-b border-surface-muted bg-surface-muted/10">
                                <Flex gap="md" align="center">
                                    <Library className="text-brand-primary" size={24} />
                                    <Stack gap="none">
                                        <Text variant="h4" weight="bold">問題集を選択</Text>
                                        <Text variant="xs" color="secondary">公式、自分、または他のユーザーの問題集を検索できます</Text>
                                    </Stack>
                                </Flex>
                            </View>

                            <View className="p-6 min-h-[500px]">
                                <CollectionBrowser
                                    selectedIds={selectedCollections.map(c => c.id)}
                                    onToggleCollection={handleToggleCollection}
                                    onAddToSet={handleOpenAddToSet}
                                />
                            </View>
                        </Card>
                    </Stack>
                </Stack>
            </Container>

            {/* 下部固定トレイ */}
            <FixedSelectionTray
                selectedCollections={selectedCollections}
                onRemoveCollection={(id) => handleToggleCollection(id, "", 0)}
                onClearAll={() => {
                    setSelectedCollections([]);
                    if (!isManualLimit) setLimit(0);
                }}
                onStart={() => setIsSettingsOpen(true)}
                startLabel="クイズを開始"
                isLoading={isLoading}
                limit={limit}
            />

            {/* 設定モーダル */}
            <QuizOptionsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                filters={filters}
                sorts={sorts}
                limit={limit}
                maxLimit={totalQuestions > 0 ? totalQuestions : 0}
                isLoading={isLoading}
                onFilterChange={setFilters}
                onSortChange={setSortCondition}
                onLimitChange={handleLimitChange}
                onStart={handleStartQuiz}
            />

            {/* セットに追加モーダル */}
            {isAddToSetModalOpen && targetCollectionId && (
                <AddToSetModal
                    collectionId={targetCollectionId}
                    onClose={() => setIsAddToSetModalOpen(false)}
                    onSuccess={() => {
                        setTargetCollectionId(null);
                        setIsAddToSetModalOpen(false);
                    }}
                />
            )}
        </View>
    );
}
