"use client";

import React from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Text } from '@/src/design/baseComponents/Text';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Badge } from '@/src/design/baseComponents/Badge';
import { View } from '@/src/design/primitives/View';
import { Collection } from '@/src/entities/collection';
import { Book, Heart, Trophy, Trash2, Edit, FolderPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/src/design/baseComponents/Checkbox';
import { Button } from '@/src/design/baseComponents/Button';
import { addFavorite, removeFavorite } from '@/src/features/favorites/api';
import { useAuth } from '@/src/shared/auth/useAuth';
import { cn } from '@/src/shared/utils/cn';
import { useState, useEffect } from 'react';

interface CollectionCardProps {
    collection: Collection;
    selectable?: boolean;
    selected?: boolean;
    isSelectionMode?: boolean;
    onSelect?: (id: string, name: string, count?: number) => void;
    onStartRanking?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
    onAddToSet?: (id: string) => void;
    onClick?: () => void;
    hideExtras?: boolean; // New prop to hide Fav/Ranking/Set buttons
}

export function CollectionCard({
    collection,
    selectable = false,
    selected = false,
    isSelectionMode = false,
    onSelect,
    onStartRanking,
    onDelete,
    onEdit,
    onAddToSet,
    onClick,
    hideExtras = false
}: CollectionCardProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [isFavorited, setIsFavorited] = useState(collection.isFavorited || false);
    const [favCount, setFavCount] = useState(collection.favoriteCount || 0);

    useEffect(() => {
        setIsFavorited(collection.isFavorited || false);
        setFavCount(collection.favoriteCount || 0);
    }, [collection.isFavorited, collection.favoriteCount]);

    const handleRankStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onStartRanking?.(collection.id);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm(`「${collection.name}」を削除しますか？`)) {
            onDelete?.(collection.id);
        }
    };

    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return;

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
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if (isSelectionMode) {
            e.preventDefault();
            e.stopPropagation();
            onSelect?.(collection.id, collection.name, collection.questionCount);
        }
    };

    return (
        <View className="relative group h-full">
            {/* チェックボックス — 選択モードまたは selectable の場合に表示 */}
            {(isSelectionMode || selectable) && (
                <View
                    zIndex="docked"
                    className={cn(
                        "absolute top-2 left-2 transition-all duration-300 p-2 rounded-full",
                        selected
                            ? "opacity-100 scale-100 bg-brand-primary/10"
                            : "opacity-40 group-hover:opacity-100 scale-95"
                    )}
                >
                    <Checkbox
                        checked={selected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onSelect?.(collection.id, collection.name, collection.questionCount);
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        className="w-5 h-5 cursor-pointer shadow-sm"
                    />
                </View>
            )}


            {/* カード本体 — クリックで詳細ページへ遷移 (選択モード時は無効化) */}
            <View
                onClick={(e) => {
                    handleCardClick(e);
                    if (isSelectionMode) return;

                    if (onClick) {
                        onClick();
                    } else {
                        router.push(`/collections/${collection.id}`);
                    }
                }}
                className={cn("h-full", !isSelectionMode && "cursor-pointer")}
            >
                <Card
                    border="primary"
                    shadow={selected ? "lg" : "sm"}
                    bg={selected ? "primary" : "card"}
                    className={cn(
                        "h-full transition-all duration-500 group-hover:shadow-lg group-hover:border-brand-primary/60 group-hover:-translate-y-0.5 overflow-hidden relative",
                        selected && "ring-4 ring-brand-primary/20 bg-brand-primary/[0.02]"
                    )}
                >
                    {/* 操作ボタン */}
                    <View zIndex="docked" className="absolute top-3 right-3 flex gap-2">
                        {onAddToSet && !hideExtras && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 h-auto rounded-full text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/30 shadow-sm transition-all active:scale-90 border-2 border-brand-primary/20"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAddToSet(collection.id);
                                }}
                                title="セットに追加"
                            >
                                <FolderPlus size={16} strokeWidth={2.5} />
                            </Button>
                        )}
                        {onEdit && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 h-auto rounded-full text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/30 shadow-sm transition-all active:scale-90"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdit(collection.id);
                                }}
                                title="コレクションを編集"
                            >
                                <Edit size={16} strokeWidth={2.5} />
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                size="sm"
                                variant="ghost"
                                color="danger"
                                className="p-2 h-auto rounded-full text-brand-danger bg-brand-danger/10 hover:bg-brand-danger/30 shadow-sm transition-all active:scale-90"
                                onClick={handleDelete}
                                title="コレクションを削除"
                            >
                                <Trash2 size={16} strokeWidth={2.5} />
                            </Button>
                        )}
                    </View>
                    <Stack gap="lg" className="h-full p-1">
                        <Flex justify="between" align="start">
                            <Stack gap="xs" className={cn(
                                "flex-1",
                                (selectable || isSelectionMode) && "pl-10",
                                (onEdit || onDelete || (onAddToSet && !hideExtras)) && "pr-24"
                            )}>
                                <Text weight="bold" variant="detail" className="line-clamp-1 group-hover:text-brand-primary transition-colors text-brand-primary/90">
                                    {collection.name}
                                </Text>
                                <Flex gap="xs" align="center">
                                    <Text variant="xs" color="secondary" className="font-medium opacity-80">
                                        by {collection.authorName || '匿名'}
                                    </Text>
                                    {collection.isOfficial && (
                                        <Badge variant="primary" className="px-2 py-0">Official</Badge>
                                    )}
                                </Flex>
                            </Stack>
                        </Flex>

                        {collection.descriptionText && (
                            <Text variant="xs" color="secondary" className="line-clamp-3 leading-relaxed opacity-90 min-h-[3rem]">
                                {collection.descriptionText}
                            </Text>
                        )}

                        <Flex justify="between" align="center" className="mt-auto pt-5 border-t border-surface-muted/50">
                            <Flex gap="xl">
                                <Flex
                                    gap="xs"
                                    align="center"
                                    title="問題数"
                                >
                                    <Book size={16} strokeWidth={2.5} className="text-brand-primary" />
                                    <Text variant="xs" weight="bold" color="primary">{collection.questionCount || 0}</Text>
                                </Flex>
                                {!hideExtras && (
                                    <Flex
                                        gap="xs"
                                        align="center"
                                        className={cn(
                                            "transition-all cursor-pointer hover:scale-110 active:scale-95",
                                            !isFavorited && "opacity-50"
                                        )}
                                        title="お気に入り"
                                        onClick={handleFavoriteToggle}
                                    >
                                        <Heart
                                            size={16}
                                            strokeWidth={2.5}
                                            className={cn(isFavorited ? "text-brand-heart fill-brand-heart" : "text-brand-heart/50")}
                                        />
                                        <Text variant="xs" weight="bold" color={isFavorited ? "danger" : "secondary"}>{favCount}</Text>
                                    </Flex>
                                )}
                                {collection.userRank && (
                                    <Flex gap="xs" align="center" title="あなたの順位" className="bg-brand-primary/10 px-2 py-0.5 rounded-full">
                                        <Trophy size={14} className="text-brand-primary" />
                                        <Text variant="xs" weight="bold" color="primary">{collection.userRank}位</Text>
                                    </Flex>
                                )}
                            </Flex>

                            {!hideExtras && (
                                <Flex gap="xs">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="p-2 h-auto rounded-full text-brand-primary hover:bg-brand-primary/10 transition-transform active:scale-90"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            router.push(`/collections/${collection.id}/ranking`);
                                        }}
                                        title="ランキングを見る"
                                    >
                                        <Trophy size={18} strokeWidth={2.5} />
                                    </Button>
                                </Flex>
                            )}
                        </Flex>
                    </Stack>
                </Card>
            </View>
        </View >
    );
}
