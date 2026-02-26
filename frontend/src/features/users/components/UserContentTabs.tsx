"use client";

import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { Stack } from '@/src/design/primitives/Stack';
import { Tabs, TabItem } from '@/src/design/baseComponents/Tabs';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Text } from '@/src/design/baseComponents/Text';
import { Grid } from '@/src/design/primitives/Grid';
import { useUserCollections, useUserCollectionSets } from '@/src/features/collections/hooks/useCollections';
import { CollectionCard } from '@/src/features/collections/components/CollectionCard';
import { CollectionSetCard } from '@/src/features/collectionSets/components/CollectionSetCard';
import { useAuth } from '@/src/shared/auth/useAuth';

interface UserContentTabsProps {
    userId: string;
    isSelectionMode?: boolean;
    selectedIds?: string[];
    onToggleCollection: (id: string, name: string, count?: number) => void;

    // Management props (Optional, for profile page)
    onDeleteCollection?: (id: string) => void;
    onEditCollection?: (id: string) => void;
    onStartRanking?: (id: string) => void;
    onAddToSet?: (id: string) => void;
    onDeleteSet?: (id: string) => void;
    onEditSet?: (id: string) => void;

    // Slots for extra actions (like "Create" buttons)
    collectionActions?: React.ReactNode;
    setActions?: React.ReactNode;
    initialTab?: 'collections' | 'sets';
    hideExtras?: boolean;
}

export function UserContentTabs({
    userId,
    isSelectionMode = false,
    selectedIds = [],
    onToggleCollection,
    onDeleteCollection,
    onEditCollection,
    onStartRanking,
    onAddToSet,
    onDeleteSet,
    onEditSet,
    collectionActions,
    setActions,
    initialTab = 'collections',
    hideExtras = false
}: UserContentTabsProps) {
    const { user } = useAuth();

    const { collections, loading: collectionsLoading } = useUserCollections(userId);
    const { collectionSets, loading: setsLoading } = useUserCollectionSets(userId);

    const items: TabItem[] = [
        {
            id: 'collections',
            label: 'コレクション',
            content: (
                <Stack gap="lg" className="pt-4">
                    {(collectionActions || collections.length > 0) && (
                        <Flex justify="between" align="center">
                            <Text variant="detail" color="secondary" weight="bold">
                                {collections.length} 個のコレクション
                            </Text>
                            {collectionActions}
                        </Flex>
                    )}

                    {collectionsLoading ? (
                        <View className="flex justify-center py-12">
                            <Spinner size="lg" />
                        </View>
                    ) : collections.length === 0 ? (
                        <Text color="secondary" align="center" variant="xs" className="py-12">
                            コレクションがありません
                        </Text>
                    ) : (
                        <Grid cols={{ sm: 2, lg: 3 }} gap="lg">
                            {collections.map(c => (
                                <CollectionCard
                                    key={c.id}
                                    collection={c}
                                    isSelectionMode={isSelectionMode}
                                    selected={selectedIds.includes(c.id)}
                                    onSelect={onToggleCollection}
                                    onDelete={onDeleteCollection}
                                    onEdit={onEditCollection}
                                    onStartRanking={onStartRanking}
                                    onAddToSet={onAddToSet}
                                    hideExtras={hideExtras}
                                />
                            ))}
                        </Grid>
                    )}
                </Stack>
            )
        },
        {
            id: 'sets',
            label: 'セット',
            content: (
                <Stack gap="lg" className="pt-4">
                    {(setActions || collectionSets.length > 0) && (
                        <Flex justify="between" align="center">
                            <Text variant="detail" color="secondary" weight="bold">
                                {collectionSets.length} 個のセット
                            </Text>
                            {setActions}
                        </Flex>
                    )}

                    {setsLoading ? (
                        <View className="flex justify-center py-12">
                            <Spinner size="lg" />
                        </View>
                    ) : collectionSets.length === 0 ? (
                        <Text color="secondary" align="center" variant="xs" className="py-12">
                            セットがありません
                        </Text>
                    ) : (
                        <Grid cols={{ sm: 2, lg: 3 }} gap="lg">
                            {collectionSets.map(s => (
                                <CollectionSetCard
                                    key={s.id}
                                    set={s}
                                    isSelectionMode={isSelectionMode}
                                    selectedCollectionIds={selectedIds}
                                    onToggleCollection={onToggleCollection}
                                    onDelete={onDeleteSet}
                                    onEdit={onEditSet}
                                />
                            ))}
                        </Grid>
                    )}
                </Stack>
            )
        }
    ];

    return (
        <View>
            <Tabs items={items} defaultTab={initialTab} fitted variant="line" />
        </View>
    );
}
