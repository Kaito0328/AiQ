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
    displayMode?: 'grid' | 'list';
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
    hideExtras = false,
    displayMode = 'list'
}: UserContentTabsProps) {
    const { collections, loading: collectionsLoading } = useUserCollections(userId);
    const { collectionSets, loading: setsLoading } = useUserCollectionSets(userId);

    const items: TabItem[] = [
        {
            id: 'collections',
            label: 'コレクション',
            content: (
                <View padding="md">
                    <Stack gap="lg">
                        {(collectionActions || collections.length > 0) && (
                            <Flex justify="between" align="center">
                                <Text variant="detail" color="secondary" weight="bold">
                                    {collections.length} 個のコレクション
                                </Text>
                                {collectionActions}
                            </Flex>
                        )}

                        {collectionsLoading ? (
                            <View padding="xl">
                                <Flex justify="center">
                                    <Spinner size="lg" />
                                </Flex>
                            </View>
                        ) : collections.length === 0 ? (
                            <View padding="xl">
                                <Text color="secondary" align="center" variant="xs">
                                    コレクションがありません
                                </Text>
                            </View>
                        ) : displayMode === 'list' ? (
                            <Stack gap="sm">
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
                                        displayMode="list"
                                    />
                                ))}
                            </Stack>
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
                                        displayMode="grid"
                                    />
                                ))}
                            </Grid>
                        )}
                    </Stack>
                </View>
            )
        },
        {
            id: 'sets',
            label: 'セット',
            content: (
                <View padding="md">
                    <Stack gap="lg">
                        {(setActions || collectionSets.length > 0) && (
                            <Flex justify="between" align="center">
                                <Text variant="detail" color="secondary" weight="bold">
                                    {collectionSets.length} 個のセット
                                </Text>
                                {setActions}
                            </Flex>
                        )}

                        {setsLoading ? (
                            <View padding="xl">
                                <Flex justify="center">
                                    <Spinner size="lg" />
                                </Flex>
                            </View>
                        ) : collectionSets.length === 0 ? (
                            <View padding="xl">
                                <Text color="secondary" align="center" variant="xs">
                                    セットがありません
                                </Text>
                            </View>
                        ) : displayMode === 'list' ? (
                            <Stack gap="sm">
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
                            </Stack>
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
                </View>
            )
        }
    ];

    return (
        <View>
            <Tabs items={items} defaultTab={initialTab} fitted variant="line" />
        </View>
    );
}
