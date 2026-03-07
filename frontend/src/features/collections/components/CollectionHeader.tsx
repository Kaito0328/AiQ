"use client"
import { logger } from '@/src/shared/utils/logger';

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
import { Heart, Edit, Globe, Lock, Unlock, BookOpen, Trophy } from 'lucide-react';
import { addFavorite, removeFavorite } from '@/src/features/favorites/api';
import { cn } from '@/src/shared/utils/cn';
import { MoreVertical, Sparkles, FileText, Download, FileUp, Play } from 'lucide-react';
import { CsvImportModal } from './CsvImportModal';
import { AiGenerationModal } from './AiGenerationModal';
import { PdfGenerationModal } from './PdfGenerationModal';
import { exportCsv } from '../api';
import { useToast } from '@/src/shared/contexts/ToastContext';

interface CollectionHeaderProps {
    collection: Collection;
    isOwner: boolean;
    questionCount: number;
    onEdit?: () => void;
    onImportCsv?: () => void;
    onExportCsv?: () => void;
    onStartRankingQuiz?: () => void;
}

export function CollectionHeader({
    collection,
    isOwner,
    questionCount,
    onEdit,
    onImportCsv,
    onExportCsv,
    onStartRankingQuiz
}: CollectionHeaderProps) {
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [isFavorited, setIsFavorited] = useState(collection.isFavorited || false);
    const [favCount, setFavCount] = useState(collection.favoriteCount || 0);
    const [loading, setLoading] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

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
            logger.error('お気に入り操作に失敗しました', err);
            showToast({ message: 'お気に入り操作に失敗しました', variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };
    const handleExportCsv = async () => {
        try {
            const blob = await exportCsv(collection.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${collection.name}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast({ message: 'CSVをエクスポートしました', variant: 'success' });
        } catch (err) {
            logger.error(err);
            showToast({ message: 'エクスポートに失敗しました', variant: 'danger' });
        }
    };

    return (
        <Card border="base">
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
                            {isOwner && (
                                <View className={cn(
                                    "p-1.5 rounded-full shadow-sm flex items-center justify-center border transition-colors",
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
                            {collection.userRank && (
                                <Badge variant="warning" className="border-amber-500/30 bg-amber-500/5 text-amber-700">
                                    <Flex gap="xs" align="center">
                                        <Trophy size={12} className="text-amber-500" />
                                        現在の順位: {collection.userRank}位
                                    </Flex>
                                </Badge>
                            )}
                        </Flex>
                    </Stack>

                    <Flex gap="sm" align="center">
                        {onStartRankingQuiz && (
                            <Button
                                variant="outline"
                                color="primary"
                                size="sm"
                                onClick={onStartRankingQuiz}
                                className="p-2 h-auto shadow-sm rounded-full"
                                title="ランキングクイズ"
                            >
                                <Trophy size={18} strokeWidth={2.5} />
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
                    <View className="border-t border-surface-muted/50 pt-4">
                        <Text variant="detail" color="secondary" className="leading-relaxed">
                            {collection.descriptionText}
                        </Text>
                    </View>
                )}

                <Flex justify="between" align="end" className="border-t border-surface-muted/50 pt-4">
                    <Flex gap="lg">
                        <Flex gap="xs" align="center" className="text-foreground/60">
                            <BookOpen size={16} />
                            <Text variant="xs" weight="bold">{questionCount} 問</Text>
                        </Flex>
                        <Flex gap="xs" align="center" className="text-foreground/60">
                            <Heart size={16} />
                            <Text variant="xs" weight="bold">{favCount} お気に入り</Text>
                        </Flex>
                        {collection.authorName && (
                            <Text variant="xs" color="secondary" className="hidden sm:block">
                                作成者: {collection.authorName}
                            </Text>
                        )}
                    </Flex>

                    {isOwner && (
                        <Flex gap="sm">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onImportCsv}
                                className="h-8 shadow-sm px-2 sm:px-3"
                                title="インポート"
                            >
                                <FileUp size={14} className="sm:mr-1.5" />
                                <Text variant="xs" weight="bold" className="hidden sm:inline">インポート</Text>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onExportCsv}
                                className="h-8 shadow-sm px-2 sm:px-3"
                                title="エクスポート"
                            >
                                <Download size={14} className="sm:mr-1.5" />
                                <Text variant="xs" weight="bold" className="hidden sm:inline">エクスポート</Text>
                            </Button>
                        </Flex>
                    )}
                </Flex>
            </Stack >
        </Card >
    );
}
