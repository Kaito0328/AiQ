"use client"
import { logger } from '@/src/shared/utils/logger';

import React from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Text } from '@/src/design/baseComponents/Text';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Badge } from '@/src/design/baseComponents/Badge';
import { View } from '@/src/design/primitives/View';
import { Collection } from '@/src/entities/collection';
import { Book, Heart, Trophy, Trash2, Edit, FolderPlus, Lock, Unlock, Cloud, AlertTriangle, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/src/design/baseComponents/Checkbox';
import { Button } from '@/src/design/baseComponents/Button';
import { addFavorite, removeFavorite } from '@/src/features/favorites/api';
import { useAuth } from '@/src/shared/auth/useAuth';
import { cn } from '@/src/shared/utils/cn';
import { useState, useEffect } from 'react';
import { useSyncStatus } from '@/src/shared/hooks/useSyncStatus';
import { useNetworkStatus } from '@/src/shared/contexts/NetworkStatusContext';

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
    displayMode?: 'grid' | 'list';
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
    hideExtras = false,
    displayMode = 'list'
}: CollectionCardProps) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const { isOnline } = useNetworkStatus();
    const [isFavorited, setIsFavorited] = useState(collection.isFavorited || false);
    const [favCount, setFavCount] = useState(collection.favoriteCount || 0);
    const syncStatus = useSyncStatus(collection.id);
    const isPending = syncStatus?.isPending;
    const hasError = syncStatus?.hasError;
    const error = syncStatus?.error;
    const actionId = syncStatus?.actionId;

    const isOwner = user?.id === collection.userId;
    const { syncManager } = require('@/src/shared/api/SyncManager');

    useEffect(() => {
        setIsFavorited(collection.isFavorited || false);
        setFavCount(collection.favoriteCount || 0);
    }, [collection.isFavorited, collection.favoriteCount]);

    // オフライン遷移のためにルートをプリフェッチ
    useEffect(() => {
        router.prefetch(`/collections/${collection.id}`);
        router.prefetch(`/collections/${collection.id}/ranking`);
    }, [router, collection.id]);



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
            logger.error('お気に入り操作に失敗しました', err);
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
                    border={hasError ? 'danger' : (isPending ? 'warning' : (displayMode === 'list' ? 'none' : 'primary'))}
                    shadow={displayMode === 'list' ? 'none' : (selected ? 'lg' : 'sm')}
                    bg={displayMode === 'list' ? 'transparent' : (selected ? 'muted' : 'card')}
                    className={cn(
                        "h-full transition-all duration-500 overflow-hidden relative",
                        displayMode !== 'list' && "group-hover:shadow-lg group-hover:border-brand-primary/60 group-hover:-translate-y-0.5",
                        selected && displayMode !== 'list' && "ring-2 ring-brand-primary/20",
                        isPending && !hasError && "border-dashed border-amber-400/60 animate-pulse-subtle",
                        hasError && "border-red-500/60 shadow-red-100/20"
                    )}
                >
                    {/* 同期ステータスアイコン */}
                    {(isPending || hasError) && (
                        <View className="absolute top-3 left-3 z-[10] flex items-center gap-1">
                            {hasError ? (
                                <Flex gap="xs">
                                    <View className="p-1 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" title={`同期エラー: ${error}`}>
                                        <AlertTriangle size={14} />
                                    </View>
                                    <View className="flex gap-1 animate-in fade-in slide-in-from-left-2">
                                        <Button 
                                            size="sm" variant="solid" color="primary" className="h-6 px-2 text-[10px] py-0"
                                            onClick={(e) => { e.stopPropagation(); actionId && syncManager.retryAction(actionId); }}
                                        >
                                            再試行
                                        </Button>
                                        <Button 
                                            size="sm" variant="outline" className="h-6 px-2 text-[10px] py-0 bg-white dark:bg-gray-800"
                                            onClick={(e) => { e.stopPropagation(); actionId && syncManager.discardAction(actionId); }}
                                        >
                                            破棄
                                        </Button>
                                    </View>
                                </Flex>
                            ) : (
                                <View className="p-1 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 animate-bounce-subtle" title="同期待ち...">
                                    <Cloud size={14} />
                                </View>
                            )}
                        </View>
                    )}

                    {/* Checkbox moved into the title flex for better layout */}
                    {/* 操作ボタン */}
                    {displayMode !== 'list' && (
                        <View zIndex="docked" className="absolute top-3 right-3 flex gap-2 items-center">
                            {isOwner && (
                                <View className={cn(
                                    "p-2 rounded-full shadow-sm flex items-center justify-center border transition-colors",
                                    collection.isOpen
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                        : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                )} title={collection.isOpen ? "公開中" : "非公開"}>
                                    {collection.isOpen ? (
                                        <Unlock size={14} strokeWidth={2.5} />
                                    ) : (
                                        <Lock size={14} strokeWidth={2.5} />
                                    )}
                                </View>
                            )}
                            {onEdit && isOwner && (
                                <Button
                                    size="sm"
                                    variant="soft"
                                    color="primary"
                                    rounded="full"
                                    className="p-2 h-auto shadow-sm"
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
                                    variant="soft"
                                    color="danger"
                                    rounded="full"
                                    className="p-2 h-auto shadow-sm"
                                    onClick={handleDelete}
                                    title="コレクションを削除"
                                >
                                    <Trash2 size={16} strokeWidth={2.5} />
                                </Button>
                            )}
                            {onAddToSet && !hideExtras && (
                                <Button
                                    size="sm"
                                    variant="soft"
                                    color="primary"
                                    rounded="full"
                                    className="p-2 h-auto shadow-sm"
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
                        </View>
                    )}

                    {displayMode === 'list' ? (
                        <Flex
                            gap="md"
                            align="center"
                            justify="between"
                            className={cn(
                                "py-3 px-1 transition-colors group/list-item border-b border-surface-muted/50 last:border-b-0",
                                selected && "bg-brand-primary/5"
                            )}
                        >
                            <Flex gap="sm" align="center" className="flex-1 min-w-0">
                                {(isSelectionMode || selectable) && (
                                    <Checkbox
                                        checked={selected}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onSelect?.(collection.id, collection.name, collection.questionCount);
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className={cn(
                                            "transition-all",
                                            selected ? "scale-105" : "opacity-70 group-hover/list-item:opacity-100"
                                        )}
                                    />
                                )}
                                <Text
                                    weight={selected ? "bold" : "medium"}
                                    variant="detail"
                                    color={selected ? "primary" : "primary"}
                                    className="truncate flex-1"
                                >
                                    {collection.name}
                                </Text>
                            </Flex>

                            <Flex gap="md" align="center" className="shrink-0">
                                <Flex gap="xs" align="center" className="opacity-70">
                                    <Book size={12} className="text-brand-primary" />
                                    <Text variant="xs" color="secondary">{collection.questionCount || 0}</Text>
                                </Flex>
                                
                                {/* List mode actions (Edit/Delete) in compact view */}
                                {!hideExtras && isOwner && (
                                    <Flex gap="xs" className="opacity-0 group-hover/list-item:opacity-100 transition-opacity ml-2">
                                        {onEdit && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="p-1 h-auto"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onEdit(collection.id);
                                                }}
                                            >
                                                <Edit size={14} className="text-brand-primary" />
                                            </Button>
                                        )}
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>
                    ) : (
                        <Stack gap="md" className="h-full p-0.5">
                            <Flex gap="md" align="center" className="w-full">
                                {(isSelectionMode || selectable) && (
                                    <Checkbox
                                        checked={selected}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onSelect?.(collection.id, collection.name, collection.questionCount);
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        className={cn(
                                            "transition-all duration-300",
                                            selected ? "scale-110" : "opacity-90 group-hover:opacity-100"
                                        )}
                                    />
                                )}
                                <Stack gap="xs" className={cn(
                                    "flex-1 min-w-0",
                                    (onEdit || onDelete || (onAddToSet && !hideExtras)) && "pr-24"
                                )}>
                                    <Text weight="bold" variant="detail" color="primary" className="line-clamp-1 group-hover:opacity-100 transition-opacity opacity-90">
                                        {collection.name}
                                    </Text>
                                    <Flex gap="xs" align="center">
                                        <Text variant="xs" color="secondary" className="font-medium opacity-80 truncate">
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

                            <Flex justify="between" align="center" className="mt-auto pt-3 border-t border-surface-muted/50">
                                <Flex gap="lg">
                                    <Flex
                                        gap="xs"
                                        align="center"
                                        title="問題数"
                                    >
                                        <Book size={16} strokeWidth={2.5} className="text-brand-primary" />
                                        <Text variant="xs" weight="bold" color="primary">{collection.questionCount || 0}</Text>
                                    </Flex>
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
                                            className={cn(isFavorited ? "text-brand-heart fill-brand-heart" : "text-brand-heart/80")}
                                        />
                                        <Text variant="xs" weight="bold" color={isFavorited ? "danger" : "secondary"}>{favCount}</Text>
                                    </Flex>
                                    {collection.userRank && (
                                        <Flex gap="xs" align="center" className="px-2 py-0.5 rounded-full bg-brand-primary/10">
                                            <Trophy size={14} className="text-brand-primary" />
                                            <Text variant="xs" weight="bold" color="primary">{collection.userRank}位</Text>
                                        </Flex>
                                    )}
                                </Flex>

                                <Flex gap="xs">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        color="primary"
                                        rounded="full"
                                        className="p-2 h-auto"
                                        disabled={!isOnline}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            router.push(`/collections/${collection.id}/ranking`);
                                        }}
                                        title={isOnline ? "ランキングを見る" : "オフライン中はランキングを表示できません"}
                                    >
                                        {isOnline ? <Trophy size={18} strokeWidth={2.5} /> : <WifiOff size={18} />}
                                    </Button>
                                </Flex>
                            </Flex>
                        </Stack>
                    )}
                </Card>
            </View>
        </View >
    );
}
