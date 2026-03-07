"use client";

import React, { useState, useEffect } from 'react';
import { View } from '@/src/design/primitives/View';
import { UserContentTabs } from '@/src/features/users/components/UserContentTabs';
import { UserListTabs } from '@/src/features/users/components/UserListTabs';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Button } from '@/src/design/baseComponents/Button';
import { Text } from '@/src/design/baseComponents/Text';
import { ChevronLeft, LayoutGrid, List } from 'lucide-react';
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
    initialTab = 'my-collections'
}: CollectionBrowserProps) {
    const { user } = useAuth();
    const [source, setSource] = useState<SourceType>(initialTab);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
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
        const commonProps = {
            isSelectionMode: true,
            selectedIds: selectedIds,
            onToggleCollection: onToggleCollection,
            onAddToSet: onAddToSet,
            hideExtras: true,
            displayMode: viewMode,
        };

        switch (source) {
            case 'official':
                return loadingOfficial ? (
                    <View className="py-12 flex justify-center"><Spinner size="lg" /></View>
                ) : officialUserId ? (
                    <UserContentTabs
                        userId={officialUserId}
                        {...commonProps}
                    />
                ) : (
                    <View className="py-12 text-center">
                        <Text color="secondary">公式コンテンツを読み込めませんでした</Text>
                    </View>
                );
            case 'my-collections':
                return user ? (
                    <UserContentTabs
                        userId={user.id}
                        {...commonProps}
                    />
                ) : (
                    <View className="py-12 text-center">
                        <Text color="secondary">ログインすると自分の問題集を表示できます</Text>
                    </View>
                );
            case 'search':
                return browsingUserId ? (
                    <Stack gap="md">
                        <Flex align="center" gap="sm" className="mb-2">
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
                            {...commonProps}
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
        <Stack gap="md" className="w-full">
            {/* Header with Source Toggles and View Mode Toggle */}
            <Flex justify="between" align="center" className="flex-wrap gap-y-3">
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
                                "px-4 sm:px-6 py-1.5 h-auto text-xs sm:text-sm font-bold transition-all",
                                source === type ? "shadow-sm" : "text-foreground/50 hover:text-foreground/80"
                            )}
                        >
                            {type === 'official' ? '公式' : type === 'my-collections' ? '自分' : '探す'}
                        </Button>
                    ))}
                </Flex>

                <Flex gap="xs" className="bg-surface-muted p-1 rounded-lg">
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
            </Flex>

            <View className="mt-4">
                {renderContent()}
            </View>
        </Stack>
    );
}
