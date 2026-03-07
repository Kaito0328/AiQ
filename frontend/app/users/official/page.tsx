"use client"
import { logger } from '@/src/shared/utils/logger';

import React, { useEffect, useState } from 'react';
import { View } from '@/src/design/primitives/View';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { getOfficialUser } from '@/src/features/auth/api';
import { UserHeader } from '@/src/features/users/components/UserHeader';
import { UserContentTabs } from '@/src/features/users/components/UserContentTabs';
import { startRankingQuiz } from '@/src/features/quiz/api';
import { Book, LayoutGrid, List } from 'lucide-react';
import { UserProfile } from '@/src/entities/user';
import { useRouter } from 'next/navigation';
import { Flex } from '@/src/design/primitives/Flex';
import { Button } from '@/src/design/baseComponents/Button';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { AddToSetModal } from '@/src/features/collectionSets/components/AddToSetModal';

export default function OfficialUserPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
    const [isAddToSetModalOpen, setIsAddToSetModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        const fetchOfficial = async () => {
            try {
                const user = await getOfficialUser();
                setProfile(user);
            } catch (err) {
                logger.error('公式ユーザーの取得に失敗しました', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOfficial();
    }, []);

    const handleStartRanking = async (id: string) => {
        try {
            const resp = await startRankingQuiz(id);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('quizData', JSON.stringify(resp));
            }
            router.push('/quiz');
        } catch (err) {
            logger.error('Failed to start ranking quiz', err);
        }
    };

    const handleOpenAddToSet = (collectionId: string) => {
        setTargetCollectionId(collectionId);
        setIsAddToSetModalOpen(true);
    };

    if (loading) {
        return (
            <View className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </View>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-surface-muted pt-20">
                <BackButton />
                <Container>
                    <Stack gap="lg" align="center" className="py-20">
                        <Text variant="h2" weight="bold">公式ユーザーが見つかりません</Text>
                    </Stack>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-muted transition-all duration-300">
            <BackButton />
            <Container className="pt-20 pb-12">
                <Stack gap="xl">
                    <UserHeader profile={profile} />

                    <UserContentTabs
                        userId={profile.id}
                        isSelectionMode={false}
                        selectedIds={[]}
                        onToggleCollection={() => { }}
                        onStartRanking={handleStartRanking}
                        onAddToSet={handleOpenAddToSet}
                        collectionActions={
                            <Flex gap="xs" className="bg-surface-muted p-1 rounded-lg ml-auto">
                                <Button
                                    size="sm"
                                    variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                                    className="p-1.5 h-auto"
                                    onClick={() => setViewMode('grid')}
                                    title="グリッド表示"
                                >
                                    <LayoutGrid size={16} className="opacity-60" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant={viewMode === 'list' ? 'solid' : 'ghost'}
                                    className="p-1.5 h-auto"
                                    onClick={() => setViewMode('list')}
                                    title="リスト表示"
                                >
                                    <List size={16} className="opacity-60" />
                                </Button>
                            </Flex>
                        }
                        hideExtras={false}
                        displayMode={viewMode}
                    />
                </Stack>
            </Container>

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
        </div>
    );
}
