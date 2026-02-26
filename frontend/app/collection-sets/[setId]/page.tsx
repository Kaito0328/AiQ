"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Grid } from '@/src/design/primitives/Grid';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { useCollectionSet } from '@/src/features/collectionSets/hooks/useCollectionSets';
import { CollectionCard } from '@/src/features/collections/components/CollectionCard';
import { QuizOptionModal } from '@/src/features/quiz/components/QuizOptionModal';
import { startCasualQuiz } from '@/src/features/quiz/api';
import { useAuth } from '@/src/shared/auth/useAuth';
import { FolderOpen, Play, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useUserCollections } from '@/src/features/collections/hooks/useCollections';
import { Card } from '@/src/design/baseComponents/Card';
import { cn } from '@/src/shared/utils/cn';
import { AddToSetModal } from '@/src/features/collectionSets/components/AddToSetModal';

export default function CollectionSetPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const setId = params.setId as string;

    const { set, collections, loading, error, removeCollection, addCollection } = useCollectionSet(setId);
    const { collections: myCollections } = useUserCollections(user?.id);

    const [showQuizOptions, setShowQuizOptions] = useState(false);
    const [isStartingQuiz, setIsStartingQuiz] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [collectionToAddToSet, setCollectionToAddToSet] = useState<string | null>(null);

    const isOwner = !!(user && set && user.id === set.userId);

    const handleStartQuiz = async (filters: any[], sorts: any[], limit: number) => {
        setIsStartingQuiz(true);
        try {
            const resp = await startCasualQuiz({
                collectionIds: [], // Empty because we use collectionSetId
                collectionSetId: setId,
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
            setShowQuizOptions(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !set) {
        return (
            <Container className="py-20 text-center">
                <Text color="danger">エラー: {error || 'セットが見つかりません'}</Text>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    戻る
                </Button>
            </Container>
        );
    }

    const availableCollections = myCollections.filter(
        mc => !collections.some(c => c.id === mc.id)
    );

    return (
        <View className="min-h-screen bg-surface-muted pb-20">
            <BackButton />

            {/* ヒーローセクション的なヘッダー */}
            <View className="bg-white border-b border-surface-muted pt-24 pb-12">
                <Container>
                    <Stack gap="xl">
                        <Flex justify="between" align="start" className="flex-col md:flex-row gap-6">
                            <Stack gap="sm" className="flex-1">
                                <Flex gap="sm" align="center" className="text-brand-primary">
                                    <FolderOpen size={24} />
                                    <Text variant="xs" weight="bold" className="uppercase tracking-wider">Collection Set</Text>
                                </Flex>
                                <Text variant="h1" weight="bold" className="text-4xl md:text-5xl">
                                    {set.name}
                                </Text>
                                <Text variant="detail" color="secondary" className="max-w-2xl leading-relaxed">
                                    {set.descriptionText || 'このセットには説明がありません。'}
                                </Text>
                            </Stack>

                            {collections.length > 0 && (
                                <Button
                                    size="lg"
                                    className="gap-3 px-8 py-7 text-lg shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all rounded-full"
                                    onClick={() => setShowQuizOptions(true)}
                                >
                                    <Play size={24} fill="currentColor" />
                                    クイズを開始
                                </Button>
                            )}
                        </Flex>
                    </Stack>
                </Container>
            </View>

            <Container className="py-12">
                <Stack gap="xl">
                    <Flex justify="between" align="center">
                        <Stack gap="none">
                            <Text variant="h3" weight="bold">構成コレクション</Text>
                            <Text variant="xs" color="secondary" className="opacity-70">
                                {collections.length} 個のコレクションが含まれています
                            </Text>
                        </Stack>

                        {isOwner && (
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => setShowAddModal(true)}
                            >
                                <Plus size={18} />
                                コレクションを追加
                            </Button>
                        )}
                    </Flex>

                    {collections.length === 0 ? (
                        <Card className="py-20 flex flex-center border-dashed border-2 border-surface-muted bg-transparent">
                            <Stack gap="md" align="center">
                                <View className="p-4 rounded-full bg-surface-muted">
                                    <FolderOpen size={32} className="text-surface-muted-foreground" />
                                </View>
                                <Text color="secondary">このセットにはまだコレクションがありません</Text>
                                {isOwner && (
                                    <Button variant="solid" onClick={() => setShowAddModal(true)}>
                                        コレクションを追加する
                                    </Button>
                                )}
                            </Stack>
                        </Card>
                    ) : (
                        <Grid cols={{ sm: 2, lg: 3 }} gap="lg">
                            {collections.map(c => (
                                <CollectionCard
                                    key={c.id}
                                    collection={c}
                                    onDelete={isOwner ? () => removeCollection(c.id) : undefined}
                                    onAddToSet={user ? (id) => setCollectionToAddToSet(id) : undefined}
                                />
                            ))}
                        </Grid>
                    )}
                </Stack>
            </Container>

            {/* コレクション追加モーダル */}
            {showAddModal && (
                <View className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
                        <View className="p-6 border-b border-surface-muted bg-surface-base">
                            <Flex justify="between" align="center">
                                <Text variant="h3" weight="bold">コレクションをセットに追加</Text>
                                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                                    閉じる
                                </Button>
                            </Flex>
                        </View>

                        <View className="flex-1 overflow-y-auto p-6">
                            {availableCollections.length === 0 ? (
                                <Text color="secondary" align="center" className="py-10">
                                    追加できるコレクションがありません
                                </Text>
                            ) : (
                                <Grid cols={{ sm: 2 }} gap="md">
                                    {availableCollections.map(mc => (
                                        <Card
                                            key={mc.id}
                                            padding="sm"
                                            className="hover:border-brand-primary cursor-pointer transition-colors border border-surface-muted"
                                            onClick={() => {
                                                addCollection(mc.id, collections.length);
                                                setShowAddModal(false);
                                            }}
                                        >
                                            <Flex gap="sm" align="center">
                                                <View className="w-10 h-10 rounded bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                                                    <FolderOpen size={20} />
                                                </View>
                                                <Stack gap="none" className="flex-1 overflow-hidden">
                                                    <Text weight="bold" variant="xs" className="truncate">{mc.name}</Text>
                                                    <Text variant="xs" color="secondary" className="truncate opacity-70">
                                                        {mc.questionCount || 0} 問
                                                    </Text>
                                                </Stack>
                                                <Plus size={18} className="text-brand-primary" />
                                            </Flex>
                                        </Card>
                                    ))}
                                </Grid>
                            )}
                        </View>
                    </Card>
                </View>
            )}

            {showQuizOptions && (
                <QuizOptionModal
                    selectedCount={collections.length}
                    onStart={handleStartQuiz}
                    onCancel={() => setShowQuizOptions(false)}
                    loading={isStartingQuiz}
                />
            )}

            {collectionToAddToSet && (
                <AddToSetModal
                    collectionId={collectionToAddToSet}
                    onClose={() => setCollectionToAddToSet(null)}
                />
            )}
        </View>
    );
}
