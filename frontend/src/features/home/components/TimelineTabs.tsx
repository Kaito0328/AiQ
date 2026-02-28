"use client";

import React from 'react';
import { Tabs, TabItem } from '@/src/design/baseComponents/Tabs';
import { Stack } from '@/src/design/primitives/Stack';
import { Grid } from '@/src/design/primitives/Grid';
import { Text } from '@/src/design/baseComponents/Text';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { CollectionCard } from '@/src/features/collections/components/CollectionCard';
import { useRecentCollections, useFolloweeCollections } from '@/src/features/collections/hooks/useCollections';
import { useAuth } from '@/src/shared/auth/useAuth';
import { AddToSetModal } from '@/src/features/collectionSets/components/AddToSetModal';
import { QuizOptionModal } from '@/src/features/quiz/components/QuizOptionModal';
import { startCasualQuiz } from '@/src/features/quiz/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface TimelineListProps {
    type: 'recent' | 'following';
    onAddToSet: (id: string) => void;
    onQuickPlay: (id: string) => void;
}

function TimelineList({ type, onAddToSet, onQuickPlay }: TimelineListProps) {
    const { isAuthenticated } = useAuth();
    const recent = useRecentCollections(type === 'recent');
    const followee = useFolloweeCollections(isAuthenticated && type === 'following');

    const currentData = type === 'following' ? followee : recent;

    if (currentData.loading) {
        return (
            <Flex justify="center" className="py-20">
                <Spinner size="lg" />
            </Flex>
        );
    }

    if (currentData.error) {
        return (
            <View className="bg-brand-danger/10 p-6 rounded-lg text-center">
                <Text color="danger">エラー: {currentData.error}</Text>
            </View>
        );
    }

    if (currentData.collections.length === 0) {
        return (
            <View className="py-20 text-center">
                <Text color="secondary">投稿がありません</Text>
            </View>
        );
    }

    return (
        <Grid cols={{ sm: 2, lg: 3 }} gap="lg">
            {currentData.collections.map((collection) => (
                <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onAddToSet={isAuthenticated ? onAddToSet : undefined}
                    onClick={() => {
                        onQuickPlay(collection.id);
                    }}
                />
            ))}
        </Grid>
    );
}

export function TimelineTabs() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [collectionToAddToSet, setCollectionToAddToSet] = useState<string | null>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
    const [isStartingQuiz, setIsStartingQuiz] = useState(false);

    const handleQuickPlay = (id: string) => {
        setSelectedCollectionId(id);
    };

    const handleStartQuiz = async (filters: any[], sorts: any[], limit: number) => {
        if (!selectedCollectionId) return;
        setIsStartingQuiz(true);
        try {
            const resp = await startCasualQuiz({
                collectionIds: [selectedCollectionId],
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
        } finally {
            setIsStartingQuiz(false);
            setSelectedCollectionId(null);
        }
    };


    const items: TabItem[] = [
        {
            id: 'recent',
            label: '最新の投稿',
            content: <TimelineList type="recent" onAddToSet={setCollectionToAddToSet} onQuickPlay={handleQuickPlay} />
        }
    ];

    if (isAuthenticated) {
        items.unshift({
            id: 'following',
            label: 'フォロー中',
            content: <TimelineList type="following" onAddToSet={setCollectionToAddToSet} onQuickPlay={handleQuickPlay} />
        });
    }

    return (
        <Stack gap="lg" className="w-full">
            <Tabs items={items} defaultTab={isAuthenticated ? 'following' : 'recent'} fitted />

            {collectionToAddToSet && (
                <AddToSetModal
                    collectionId={collectionToAddToSet}
                    onClose={() => setCollectionToAddToSet(null)}
                />
            )}

            {selectedCollectionId && (
                <QuizOptionModal
                    selectedCount={1}
                    onStart={handleStartQuiz}
                    onCancel={() => setSelectedCollectionId(null)}
                    loading={isStartingQuiz}
                />
            )}
        </Stack>
    );
}
