"use client";

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
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
    const params = useParams();
    const userId = params.userId as string;

    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const data = await listFavorites(userId);
                setCollections(data);
            } catch (err) {
                console.error('お気に入りの取得に失敗しました', err);
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
        <View className="min-h-screen bg-surface-muted py-12">
            <Container>
                <Stack gap="xl">
                    <Stack gap="sm">
                        <Text variant="h1" weight="bold" className="flex items-center gap-2">
                            <Heart size={28} className="text-brand-heart" />
                            お気に入り
                        </Text>
                        <Text color="secondary">{collections.length} 件のコレクション</Text>
                    </Stack>

                    {collections.length === 0 ? (
                        <View className="py-20 text-center">
                            <Text color="secondary">お気に入りのコレクションはまだありません</Text>
                        </View>
                    ) : (
                        <Grid cols={{ sm: 2, lg: 3 }} gap="md">
                            {collections.map(collection => (
                                <CollectionCard
                                    key={collection.id}
                                    collection={collection}
                                />
                            ))}
                        </Grid>
                    )}
                </Stack>
            </Container>
        </View>
    );
}
