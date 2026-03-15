"use client"
import { logger } from '@/src/shared/utils/logger';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { Grid } from '@/src/design/primitives/Grid';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Collection } from '@/src/entities/collection';
import { listFavorites } from '@/src/features/favorites/api';
import { CollectionCard } from '@/src/features/collections/components/CollectionCard';
import { Heart, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/src/design/baseComponents/Button';
import { Flex } from '@/src/design/primitives/Flex';

export default function FavoritesPage() {
    const params = useParams();
    const userId = params.userId as string;

    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const data = await listFavorites(userId);
                setCollections(data);
            } catch (err) {
                logger.error('お気に入りの取得に失敗しました', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [userId]);

    if (loading) {
        return (
            <View className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </View>
        );
    }

    return (
        <View className="min-h-screen bg-surface-muted pb-12">
            <Container className="pt-6">
                <Stack gap="xl">
                    <Flex justify="between" align="end">
                        <Stack gap="sm">
                            <Text variant="h1" weight="bold" className="flex items-center gap-2">
                                <Heart size={28} className="text-brand-heart" />
                                お気に入り
                            </Text>
                            <Text color="secondary">{collections.length} 件のコレクション</Text>
                        </Stack>
                        
                        <View className="flex items-center bg-surface-muted/50 p-1 rounded-lg border border-surface-muted gap-1">
                            <Button
                                variant={displayMode === 'grid' ? 'solid' : 'ghost'}
                                color={displayMode === 'grid' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setDisplayMode('grid')}
                                className="px-3"
                            >
                                <LayoutGrid size={18} />
                            </Button>
                            <Button
                                variant={displayMode === 'list' ? 'solid' : 'ghost'}
                                color={displayMode === 'list' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setDisplayMode('list')}
                                className="px-3"
                            >
                                <List size={18} />
                            </Button>
                        </View>
                    </Flex>

                    {collections.length === 0 ? (
                        <View className="py-20 text-center">
                            <Text color="secondary">お気に入りのコレクションはまだありません</Text>
                        </View>
                    ) : (
                        <Grid cols={displayMode === 'grid' ? { sm: 2, lg: 3 } : 1} gap="md">
                            {collections.map(collection => (
                                <CollectionCard
                                    key={collection.id}
                                    collection={collection}
                                    displayMode={displayMode}
                                />
                            ))}
                        </Grid>
                    )}
                </Stack>
            </Container>
        </View>
    );
}
