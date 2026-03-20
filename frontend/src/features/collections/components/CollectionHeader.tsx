"use client";
import { logger } from "@/src/shared/utils/logger";

import React, { useState } from "react";
import { Card } from "@/src/design/baseComponents/Card";
import { Stack } from "@/src/design/primitives/Stack";
import { Flex } from "@/src/design/primitives/Flex";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { Badge } from "@/src/design/baseComponents/Badge";
import { View } from "@/src/design/primitives/View";
import { Collection } from "@/src/entities/collection";
import { useAuth } from "@/src/shared/auth/useAuth";
import { Heart, Edit, Lock, Unlock, BookOpen, Trophy } from "lucide-react";
import { addFavorite, removeFavorite } from "@/src/features/favorites/api";
import { cn } from "@/src/shared/utils/cn";
import { Download, FileUp } from "lucide-react";
import { useToast } from "@/src/shared/contexts/ToastContext";
import { useCollectionOffline } from "../hooks/useCollectionOffline";
import { useNetworkStatus } from "@/src/shared/contexts/NetworkStatusContext";
import { CloudDownload, CheckCircle2, Loader2 } from "lucide-react";

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
  onStartRankingQuiz,
}: CollectionHeaderProps) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { isOnline } = useNetworkStatus();

  const { isOfflineAvailable, isSyncing, downloadCollection, removeOffline } =
    useCollectionOffline(collection);

  const [isFavorited, setIsFavorited] = useState(
    collection.isFavorited || false,
  );
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
        setFavCount((prev) => Math.max(0, prev - 1));
      } else {
        await addFavorite(collection.id);
        setIsFavorited(true);
        setFavCount((prev) => prev + 1);
      }
    } catch (err) {
      logger.error("お気に入り操作に失敗しました", err);
      showToast({ message: "お気に入り操作に失敗しました", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card border="base">
      <Stack gap="none" className="gap-0 sm:gap-3">
        <Flex justify="between" align="start" className="flex-wrap gap-3">
          <Stack gap="sm" className="flex-1">
            <Flex gap="sm" align="center">
              <BookOpen size={24} className="text-brand-primary shrink-0" />
              <Text variant="h2" weight="bold" className="leading-tight">
                {collection.name}
              </Text>
            </Flex>
            <Flex gap="sm" align="center" className="flex-wrap">
              {collection.isOfficial && (
                <Badge variant="primary">Official</Badge>
              )}
              {collection.authorName && (
                <Text variant="xs" color="secondary">
                  作成者: {collection.authorName}
                </Text>
              )}
            </Flex>
          </Stack>

          <Flex gap="sm" align="center">
            {isOwner && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="gap-1.5 rounded-xl border-surface-muted"
                title="編集"
              >
                <Edit size={16} />
                編集
              </Button>
            )}
          </Flex>
        </Flex>

        {isOwner && (
          <Flex
            gap="sm"
            align="center"
            className="justify-end pt-0 mt-0 sm:mt-3"
          >
            <Text
              variant="xs"
              color="secondary"
              className={cn("mr-auto opacity-60", !isOnline && "hidden")}
            >
              データ操作:
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={onImportCsv}
              disabled={!isOnline}
              className="h-8 px-2 text-secondary hover:text-primary transition-colors"
              title={isOnline ? "インポート" : "オフライン中は利用できません"}
            >
              <FileUp size={14} className="mr-1.5" />
              <Text variant="xs" weight="bold">
                インポート
              </Text>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportCsv}
              disabled={!isOnline}
              className="h-8 px-2 text-secondary hover:text-primary transition-colors"
              title={isOnline ? "エクスポート" : "オフライン中は利用できません"}
            >
              <Download size={14} className="mr-1.5" />
              <Text variant="xs" weight="bold">
                エクスポート
              </Text>
            </Button>
          </Flex>
        )}

        {collection.descriptionText && (
          <View className="border-t border-surface-muted/30 pt-4">
            <Text
              variant="detail"
              color="secondary"
              className="leading-relaxed opacity-90"
            >
              {collection.descriptionText}
            </Text>
          </View>
        )}

        <Flex
          align="center"
          gap="sm"
          className="flex-wrap gap-y-2 pt-0 mt-0 sm:mt-1 sm:pt-2 sm:border-t sm:border-surface-muted/30"
        >
          <Flex
            gap="xs"
            align="center"
            className="bg-surface-muted/40 px-2 py-1 rounded-lg"
          >
            <BookOpen size={14} className="text-brand-primary" />
            <Text variant="xs" weight="bold">
              {questionCount} 問
            </Text>
          </Flex>

          <Flex
            gap="xs"
            align="center"
            className="bg-surface-muted/40 px-2 py-1 rounded-lg"
          >
            <Heart size={14} className="text-brand-heart" />
            <Text variant="xs" weight="bold">
              {favCount}
            </Text>
          </Flex>

          {isOwner && (
            <View
              className={cn(
                "p-1 rounded-lg flex items-center justify-center border transition-colors",
                collection.isOpen
                  ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10"
                  : "bg-amber-500/5 text-amber-600 border-amber-500/10",
              )}
            >
              {collection.isOpen ? (
                <Flex gap="xs" align="center" className="px-1.5">
                  <Unlock size={12} strokeWidth={2.5} />
                  <Text variant="xs" weight="bold">
                    公開中
                  </Text>
                </Flex>
              ) : (
                <Flex gap="xs" align="center" className="px-1.5">
                  <Lock size={12} strokeWidth={2.5} />
                  <Text variant="xs" weight="bold">
                    非公開
                  </Text>
                </Flex>
              )}
            </View>
          )}

          {onStartRankingQuiz && (
            <Button
              variant="soft"
              color="primary"
              size="sm"
              onClick={onStartRankingQuiz}
              disabled={!isOnline}
              className="h-7 gap-1.5 px-3 rounded-lg"
              title={
                isOnline
                  ? "ランキングを表示"
                  : "ランキングクイズはオフラインではプレイできません"
              }
            >
              <Trophy size={14} strokeWidth={2.5} />
              <Text variant="xs" weight="bold" className="hidden sm:inline">
                {isOnline ? "ランキング" : "オンライン専用"}
              </Text>
            </Button>
          )}

          {collection.userRank && (
            <Flex
              gap="xs"
              align="center"
              className="bg-amber-500/10 text-amber-700 px-3 py-1 rounded-lg border border-amber-500/20"
            >
              <Trophy size={12} className="text-amber-500" />
              <Text variant="xs" weight="bold">
                {collection.userRank}位
              </Text>
            </Flex>
          )}

          <View className="ml-auto flex items-center gap-2">
            {/* オフライン保存ボタン */}
            <Button
              variant="ghost"
              color={isOfflineAvailable ? "success" : "secondary"}
              size="sm"
              onClick={isOfflineAvailable ? removeOffline : downloadCollection}
              disabled={isSyncing}
              className={cn(
                "rounded-lg px-3 transition-all h-8",
                isOfflineAvailable && "bg-brand-success/10",
              )}
              title={
                isOfflineAvailable
                  ? "オフライン保存済み (クリックで削除)"
                  : "オフライン保存"
              }
            >
              {isSyncing ? (
                <Loader2 size={16} className="mr-1.5 animate-spin" />
              ) : isOfflineAvailable ? (
                <CheckCircle2 size={16} className="mr-1.5" />
              ) : (
                <CloudDownload size={16} className="mr-1.5" />
              )}
              <Text
                variant="xs"
                weight="bold"
                color="inherit"
                className="sm:hidden"
              >
                {isSyncing
                  ? "保存中"
                  : isOfflineAvailable
                    ? "保存済み"
                    : "保存"}
              </Text>
              <Text
                variant="xs"
                weight="bold"
                color="inherit"
                className="hidden sm:inline"
              >
                {isSyncing
                  ? "保存中..."
                  : isOfflineAvailable
                    ? "オフライン保存済み"
                    : "オフライン保存"}
              </Text>
            </Button>

            <Button
              variant="ghost"
              color={isFavorited ? "heart" : "secondary"}
              size="sm"
              onClick={handleFavoriteToggle}
              className={cn(
                "rounded-lg px-3 transition-all h-8",
                isFavorited && "bg-brand-heart/10",
              )}
            >
              <Heart
                size={16}
                className={cn("mr-1.5", isFavorited && "fill-current")}
              />
              <Text variant="xs" weight="bold" color="inherit">
                {isFavorited ? "お気に入り済み" : "お気に入り"}
              </Text>
            </Button>
          </View>
        </Flex>
      </Stack>
    </Card>
  );
}
