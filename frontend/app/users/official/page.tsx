"use client";

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
import { Book } from 'lucide-react';
import { UserProfile } from '@/src/entities/user';
import { useRouter } from 'next/navigation';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { AddToSetModal } from '@/src/features/collectionSets/components/AddToSetModal';

export default function OfficialUserPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
    const [isAddToSetModalOpen, setIsAddToSetModalOpen] = useState(false);

    useEffect(() => {
        const fetchOfficial = async () => {
            try {
                const user = await getOfficialUser();
                setProfile(user);
            } catch (err) {
                console.error('公式ユーザーの取得に失敗しました', err);
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
            console.error('Failed to start ranking quiz', err);
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
                    <Stack gap="sm" align="center" className="text-center">
                        <Book size={32} className="text-brand-primary" />
                        <Text variant="h1" weight="bold">公式の問題集</Text>
                        <Text color="secondary" variant="detail">
                            公式が提供する学習コレクション
                        </Text>
                    </Stack>

                    <UserHeader profile={profile} />

                    <UserContentTabs
                        userId={profile.id}
                        isSelectionMode={false}
                        selectedIds={[]}
                        onToggleCollection={() => { }}
                        onStartRanking={handleStartRanking}
                        onAddToSet={handleOpenAddToSet}
                        hideExtras={false}
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
