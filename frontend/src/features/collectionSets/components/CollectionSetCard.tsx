import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Text } from '@/src/design/baseComponents/Text';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { CollectionSet } from '@/src/entities/collection';
import { FolderOpen, ChevronRight, Edit, Trash2, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import Link from 'next/link';
import { cn } from '@/src/shared/utils/cn';
import { useCollectionSet } from '@/src/features/collectionSets/hooks/useCollectionSets';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Checkbox } from '@/src/design/baseComponents/Checkbox';

interface CollectionSetCardProps {
    set: CollectionSet;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onClick?: (id: string) => void;
    isSelectionMode?: boolean;
    selectedCollectionIds?: string[];
    onToggleCollection?: (id: string, name: string, count?: number) => void;
}

export function CollectionSetCard({
    set,
    onEdit,
    onDelete,
    onClick,
    isSelectionMode,
    selectedCollectionIds = [],
    onToggleCollection,
}: CollectionSetCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { collections, loading } = useCollectionSet(isExpanded ? set.id : undefined);

    const handleCardClick = (e: React.MouseEvent) => {
        if (isSelectionMode) {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
            if (onClick) onClick(set.id);
        }
    };

    const cardContent = (
        <Card
            border="primary"
            padding="lg"
            className={cn(
                "h-full transition-all duration-300 group-hover:shadow-lg group-hover:border-brand-primary/60 overflow-hidden",
                !isExpanded && "group-hover:-translate-y-0.5",
                isExpanded && "border-brand-primary bg-brand-primary/[0.02]"
            )}
        >
            <Stack gap="md" className="h-full">
                <Flex gap="md" align="center">
                    <View padding="md" rounded="lg" className="bg-brand-primary/10 text-brand-primary">
                        <FolderOpen size={24} />
                    </View>
                    <Stack gap="none" className="flex-1 pr-16">
                        <Text weight="bold" variant="detail" className="line-clamp-1 group-hover:text-brand-primary transition-colors">
                            {set.name}
                        </Text>
                        <Text variant="xs" color="secondary" className="opacity-80">
                            {set.isOpen ? '公開' : '非公開'}
                        </Text>
                    </Stack>
                </Flex>

                <View className="flex-1">
                    <Text variant="xs" color="secondary" className="line-clamp-2 leading-relaxed opacity-90">
                        {set.descriptionText || '説明はありません'}
                    </Text>
                </View>

                <Flex justify="between" align="center" className="pt-4 border-t border-surface-muted/50">
                    <Text variant="xs" color="primary" weight="bold" className="flex items-center gap-1 transition-transform">
                        {isSelectionMode ? (isExpanded ? '閉じる' : 'セット内を表示') : '詳細を見る'}
                        {isSelectionMode ? (
                            <ChevronDown size={14} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
                        ) : (
                            <ChevronRight size={14} className="group-hover:translate-x-1" />
                        )}
                    </Text>
                </Flex>

                {isExpanded && (
                    <View className="mt-4 pt-4 border-t border-surface-muted/50 transition-all animate-in slide-in-from-top-2 duration-300">
                        {loading ? (
                            <View padding="lg">
                                <Flex justify="center">
                                    <Spinner size="sm" />
                                </Flex>
                            </View>
                        ) : collections.length === 0 ? (
                            <View padding="sm">
                                <Text variant="xs" color="secondary" align="center">コレクションがありません</Text>
                            </View>
                        ) : (
                            <Stack gap="xs">
                                {collections.map(c => {
                                    const isSelected = selectedCollectionIds.includes(c.id);
                                    return (
                                        <View
                                            key={c.id}
                                            padding="xs"
                                            rounded="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleCollection?.(c.id, c.name, c.questionCount);
                                            }}
                                            className={cn(
                                                "group/item transition-colors px-2 py-1.5",
                                                isSelected
                                                    ? "bg-brand-primary/10 border-transparent"
                                                    : "hover:bg-brand-primary/5 border-transparent"
                                            )}
                                        >
                                            <Flex align="center" justify="between" gap="sm">
                                                <Flex align="center" gap="sm" className="flex-1 min-w-0">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        readOnly
                                                        className={cn(
                                                            "transition-all shadow-sm",
                                                            isSelected ? "scale-105" : "opacity-70 group-hover/item:opacity-100"
                                                        )}
                                                    />
                                                    <Text variant="xs" weight={isSelected ? "bold" : "medium"} className="truncate">
                                                        {c.name}
                                                    </Text>
                                                </Flex>
                                                <Text variant="xs" color="secondary" className="opacity-60 shrink-0">{c.questionCount || 0}</Text>
                                            </Flex>
                                        </View>
                                    );
                                })}
                            </Stack>
                        )}
                    </View>
                )}
            </Stack>
        </Card>
    );

    return (
        <View className="relative group h-full">
            <View zIndex="docked" className="absolute top-2 right-2">
                <Flex gap="sm">
                    {onEdit && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="p-2 h-auto rounded-full text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/20 shadow-sm transition-all active:scale-90"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEdit(set.id);
                            }}
                        >
                            <Edit size={16} strokeWidth={2.5} />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            size="sm"
                            variant="ghost"
                            color="danger"
                            className="p-2 h-auto rounded-full text-brand-danger bg-brand-danger/5 hover:bg-brand-danger/20 shadow-sm transition-all active:scale-90"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (window.confirm(`セット「${set.name}」を削除しますか？`)) {
                                    onDelete(set.id);
                                }
                            }}
                        >
                            <Trash2 size={16} strokeWidth={2.5} />
                        </Button>
                    )}
                </Flex>
            </View>

            {
                isSelectionMode ? (
                    <View onClick={handleCardClick} className="block h-full cursor-pointer">
                        {cardContent}
                    </View>
                ) : (
                    <Link href={`/collection-sets/${set.id}`} className="block h-full">
                        {cardContent}
                    </Link>
                )
            }
        </View >
    );
}
