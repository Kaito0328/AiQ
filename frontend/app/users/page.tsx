"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { UserListTabs } from '@/src/features/users/components/UserListTabs';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Button } from '@/src/design/baseComponents/Button';
import { UserHeader } from '@/src/features/users/components/UserHeader';
import { UserContentTabs } from '@/src/features/users/components/UserContentTabs';
import { useProfile } from '@/src/features/users/hooks/useProfile';
import { ArrowLeft } from 'lucide-react';

function UsersPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const offlineUserId = searchParams.get('offlineUserId');

    const { profile, loading, error } = useProfile(offlineUserId || undefined);

    if (offlineUserId) {
        return (
            <View className="min-h-screen bg-surface-muted pb-12">
                <Container className="pt-6">
                    <Stack gap="lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-fit gap-1.5"
                            onClick={() => router.replace('/users')}
                        >
                            <ArrowLeft size={16} />
                            一覧へ戻る
                        </Button>

                        {loading ? (
                            <View className="py-16 flex justify-center">
                                <Spinner size="lg" />
                            </View>
                        ) : !profile ? (
                            <View className="py-16 text-center">
                                <Text color="secondary">
                                    {error || 'このユーザーのオフラインデータが見つかりません'}
                                </Text>
                            </View>
                        ) : (
                            <>
                                <UserHeader profile={profile} />
                                <UserContentTabs
                                    userId={offlineUserId}
                                    isSelectionMode={false}
                                    selectedIds={[]}
                                    onToggleCollection={() => {}}
                                    hideExtras={false}
                                    displayMode="list"
                                />
                            </>
                        )}
                    </Stack>
                </Container>
            </View>
        );
    }

    return (
        <View className="min-h-screen bg-surface-muted pb-12">
            <Container className="pt-6">
                <Stack gap="xl">
                    <Text variant="h1" weight="bold">ユーザー一覧</Text>
                    <UserListTabs />
                </Stack>
            </Container>
        </View>
    );
}

export default function UsersPage() {
    return (
        <Suspense
            fallback={
                <View className="min-h-screen bg-surface-muted pb-12">
                    <Container className="pt-6">
                        <View className="py-16 flex justify-center">
                            <Spinner size="lg" />
                        </View>
                    </Container>
                </View>
            }
        >
            <UsersPageContent />
        </Suspense>
    );
}
