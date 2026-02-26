"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Badge } from '@/src/design/baseComponents/Badge';
import { View } from '@/src/design/primitives/View';
import { Collection } from '@/src/entities/collection';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Heart, Edit, Globe, Lock, BookOpen } from 'lucide-react';
import { addFavorite, removeFavorite } from '@/src/features/favorites/api';
import { cn } from '@/src/shared/utils/cn';

interface CollectionHeaderProps {
    collection: Collection;
    isOwner: boolean;
    questionCount: number;
    onEdit?: () => void;
}

export function CollectionHeader({ collection, isOwner, questionCount, onEdit }: CollectionHeaderProps) {
    const { isAuthenticated } = useAuth();
    const [isFavorited, setIsFavorited] = useState(collection.isFavorited || false);
    const [favCount, setFavCount] = useState(collection.favoriteCount || 0);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        setIsFavorited(collection.isFavorited || false);
        setFavCount(collection.favoriteCount || 0);
    }, [collection.isFavorited, collection.favoriteCount]);

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated || loading) return;
        setLoading(true);
        try {
            if (isFavorited) {
                await removeFavorite(collection.id);
                setIsFavorited(false);
                setFavCount(prev => Math.max(0, prev - 1));
            } else {
                await addFavorite(collection.id);
                setIsFavorited(true);
                setFavCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('お気に入り操作に失敗しました', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border border-gray-300">
            <Stack gap="lg">
                <Flex justify="between" align="start" className="flex-wrap gap-4">
                    <Stack gap="sm" className="flex-1">
                        <Flex gap="sm" align="center">
                            <BookOpen size={24} className="text-brand-primary" />
                            <Text variant="h2" weight="bold">{collection.name}</Text>
                        </Flex>
                        <Flex gap="sm" align="center">
                            {collection.isOfficial && (
                                <Badge variant="primary">Official</Badge>
                            )}
                            <Badge variant="secondary">
                                {collection.isOpen ? (
                                    <Flex gap="xs" align="center"><Globe size={12} /> 公開</Flex>
                                ) : (
                                    <Flex gap="xs" align="center"><Lock size={12} /> 非公開</Flex>
                                )}
                            </Badge>
                        </Flex>
                    </Stack>

                    <Flex gap="sm" align="center">
                        {isAuthenticated && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleFavoriteToggle}
                                className={cn(
                                    "gap-1.5 transition-colors",
                                    isFavorited ? "text-brand-heart" : "text-foreground/50"
                                )}
                            >
                                <Heart
                                    size={20}
                                    className={cn(isFavorited && "fill-brand-heart")}
                                />
                                <Text variant="xs" weight="bold">{favCount}</Text>
                            </Button>
                        )}
                        {isOwner && onEdit && (
                            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
                                <Edit size={16} />
                                編集
                            </Button>
                        )}
                    </Flex>
                </Flex>

                {collection.descriptionText && (
                    <View className="border-t border-gray-200 pt-4">
                        <Text variant="detail" color="secondary" className="leading-relaxed">
                            {collection.descriptionText}
                        </Text>
                    </View>
                )}

                <Flex gap="lg" className="border-t border-gray-200 pt-4">
                    <Flex gap="xs" align="center" className="text-foreground/60">
                        <BookOpen size={16} />
                        <Text variant="xs" weight="bold">{questionCount} 問</Text>
                    </Flex>
                    <Flex gap="xs" align="center" className="text-foreground/60">
                        <Heart size={16} />
                        <Text variant="xs" weight="bold">{favCount} お気に入り</Text>
                    </Flex>
                    {collection.authorName && (
                        <Text variant="xs" color="secondary">
                            作成者: {collection.authorName}
                        </Text>
                    )}
                </Flex>
            </Stack>
        </Card>
    );
}
