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
import { FilterCondition, SortCondition, QuizMode, FilterType, SortKey, FilterNode } from '@/src/entities/quiz';
import { QuizOptionsModal } from '@/src/features/quiz/components/QuizOptionsModal';
import { Flex } from '@/src/design/primitives/Flex';
import { Library, ChevronLeft } from 'lucide-react';
import { Button } from '@/src/design/baseComponents/Button';
import { AddToSetModal } from '@/src/features/collectionSets/components/AddToSetModal';
import { useAiqScorer } from '@/src/features/quiz/hooks/useAiqScorer';

export default function QuizStartPage() {
    const router = useRouter();
    const [selectedCollections, setSelectedCollections] = useState<{ id: string, name: string, questionCount: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Quiz options state
    const [filterNode, setFilterNode] = useState<FilterNode | undefined>(undefined);
    const [sorts, setSorts] = useState<SortCondition[]>([{ key: SortKey.RANDOM }]);
    const [limit, setLimit] = useState(30);
    const [isManualLimit, setIsManualLimit] = useState(false);
    const [preferredMode, setPreferredMode] = useState<QuizMode>('text');
    const [dummyCharCount, setDummyCharCount] = useState(6);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Add to set state
    const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
    const [isAddToSetModalOpen, setIsAddToSetModalOpen] = useState(false);

    const scorer = useAiqScorer();

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
            // If fuzzy mode: start model download concurrently with the API call
            const maybeLoadModel = preferredMode === 'fuzzy' && !scorer.isReady
                ? scorer.load()
                : Promise.resolve();

            const [resp] = await Promise.all([
                startCasualQuiz({
                    collectionIds: selectedCollections.map(c => c.id),
                    filterNode,
                    sorts,
                    limit,
                    preferredMode,
                    dummyCharCount
                }),
                maybeLoadModel,
            ]);
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
        <View className="min-h-screen bg-surface-muted pb-72">
            <Container className="pt-6 sm:pt-8 w-full max-w-4xl">
                <Flex align="center" justify="between" className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="gap-1 px-2 text-secondary hover:text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} strokeWidth={3} />
                        <Text variant="body" weight="bold">戻る</Text>
                    </Button>
                </Flex>

                <Stack gap="xl">
                    <Stack gap="lg" className="px-1">
                        <Flex gap="md" align="center" className="mb-2">
                            <Library className="text-brand-primary" size={28} />
                            <Text variant="h3" weight="bold">問題集を選択</Text>
                        </Flex>

                        <CollectionBrowser
                            selectedIds={selectedCollections.map(c => c.id)}
                            onToggleCollection={handleToggleCollection}
                            onAddToSet={handleOpenAddToSet}
                        />
                    </Stack>
                </Stack>
            </Container>

            {/* Fuzzy mode: AI model loading banner */}
            {preferredMode === 'fuzzy' && scorer.isLoading && (
                <View className="fixed bottom-28 left-0 right-0 z-40 flex justify-center px-4">
                    <View className="flex items-center gap-3 bg-surface-base border border-brand-primary/30 rounded-xl px-5 py-3 shadow-lg max-w-sm w-full">
                        <View className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin shrink-0" />
                        <Stack gap="none" className="flex-1">
                            <Text variant="xs" weight="bold">AIモデルをロード中...</Text>
                            <View className="mt-1 h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                                <View
                                    className="h-full bg-brand-primary rounded-full transition-all duration-300"
                                    style={{ width: `${scorer.progress}%` }}
                                />
                            </View>
                        </Stack>
                        <Text variant="xs" color="secondary" className="font-mono shrink-0">{scorer.progress}%</Text>
                    </View>
                </View>
            )}

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
                maxLimit={totalQuestions > 0 ? totalQuestions : 0}
                onLimitChange={handleLimitChange}
            />

            {/* 設定モーダル */}
            <QuizOptionsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                filterNode={filterNode}
                sorts={sorts}
                limit={limit}
                maxLimit={totalQuestions > 0 ? totalQuestions : 0}
                isLoading={isLoading}
                onFilterNodeChange={setFilterNode}
                onSortChange={setSorts}
                onLimitChange={handleLimitChange}
                preferredMode={preferredMode}
                onModeChange={setPreferredMode}
                dummyCharCount={dummyCharCount}
                onDummyCountChange={setDummyCharCount}
                onStart={handleStartQuiz}
                hideLimit={true}
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
