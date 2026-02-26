"use client";

import React, { useState, useEffect } from 'react';
import { View } from '@/src/design/primitives/View';
import { UserContentTabs } from '@/src/features/users/components/UserContentTabs';
import { UserListTabs } from '@/src/features/users/components/UserListTabs';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Button } from '@/src/design/baseComponents/Button';
import { Text } from '@/src/design/baseComponents/Text';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/src/shared/auth/useAuth';
import { getOfficialUser } from '@/src/features/auth/api';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { cn } from '@/src/shared/utils/cn';

interface CollectionBrowserProps {
    selectedIds: string[];
    onToggleCollection: (id: string, name: string, count?: number) => void;
    onAddToSet?: (id: string) => void;
    initialTab?: 'official' | 'my-collections' | 'search';
}

type SourceType = 'official' | 'my-collections' | 'search';

export function CollectionBrowser({
    selectedIds,
    onToggleCollection,
    onAddToSet,
    initialTab = 'official'
}: CollectionBrowserProps) {
    const { user } = useAuth();
    const [source, setSource] = useState<SourceType>(initialTab);
    const [browsingUserId, setBrowsingUserId] = useState<string | null>(null);
    const [browsingUsername, setBrowsingUsername] = useState<string | null>(null);
    const [officialUserId, setOfficialUserId] = useState<string | null>(null);
    const [loadingOfficial, setLoadingOfficial] = useState(true);

    useEffect(() => {
        getOfficialUser()
            .then(u => {
                setOfficialUserId(u.id);
                setLoadingOfficial(false);
            })
            .catch(err => {
                console.error('Failed to fetch official user', err);
                setLoadingOfficial(false);
            });
    }, []);

    const renderContent = () => {
        switch (source) {
            case 'official':
                return loadingOfficial ? (
                    <View className="py-20 flex justify-center"><Spinner size="lg" /></View>
                ) : officialUserId ? (
                    <UserContentTabs
                        userId={officialUserId}
                        isSelectionMode={true}
                        selectedIds={selectedIds}
                        onToggleCollection={onToggleCollection}
                        onAddToSet={onAddToSet}
                        hideExtras={true}
                    />
                ) : (
                    <View className="py-20 text-center">
                        <Text color="secondary">公式コンテンツを読み込めませんでした</Text>
                    </View>
                );
            case 'my-collections':
                return user ? (
                    <UserContentTabs
                        userId={user.id}
                        isSelectionMode={true}
                        selectedIds={selectedIds}
                        onToggleCollection={onToggleCollection}
                        onAddToSet={onAddToSet}
                        hideExtras={true}
                    />
                ) : (
                    <View className="py-20 text-center">
                        <Text color="secondary">ログインすると自分の問題集を表示できます</Text>
                    </View>
                );
            case 'search':
                return browsingUserId ? (
                    <Stack gap="lg">
                        <Flex align="center" gap="sm" className="mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 pr-2"
                                onClick={() => {
                                    setBrowsingUserId(null);
                                    setBrowsingUsername(null);
                                }}
                            >
                                <ChevronLeft size={20} />
                                戻る
                            </Button>
                            <Text weight="bold" variant="h4">{browsingUsername} のコンテンツ</Text>
                        </Flex>
                        <UserContentTabs
                            userId={browsingUserId}
                            isSelectionMode={true}
                            selectedIds={selectedIds}
                            onToggleCollection={onToggleCollection}
                            onAddToSet={onAddToSet}
                            hideExtras={true}
                        />
                    </Stack>
                ) : (
                    <UserListTabs
                        onUserClick={(u) => {
                            setBrowsingUserId(u.id);
                            setBrowsingUsername(u.username);
                        }}
                    />
                );
        }
    };

    return (
        <Stack gap="lg" className="w-full">
            {/* Source Toggles */}
            <Flex gap="xs" className="bg-surface-muted p-1 rounded-xl w-fit">
                {(['official', 'my-collections', 'search'] as const).map((type) => (
                    <Button
                        key={type}
                        size="sm"
                        variant={source === type ? 'solid' : 'ghost'}
                        color={source === type ? 'primary' : 'secondary'}
                        onClick={() => {
                            setSource(type);
                            if (type !== 'search') {
                                setBrowsingUserId(null);
                                setBrowsingUsername(null);
                            }
                        }}
                        className={cn(
                            "px-6 py-2 h-auto text-sm font-bold transition-all",
                            source === type ? "shadow-sm" : "text-foreground/50 hover:text-foreground/80"
                        )}
                    >
                        {type === 'official' ? '公式' : type === 'my-collections' ? '自分' : 'ユーザーから探す'}
                    </Button>
                ))}
            </Flex>

            <View className="mt-4">
                {renderContent()}
            </View>
        </Stack>
    );
}
