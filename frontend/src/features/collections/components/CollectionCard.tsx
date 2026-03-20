"use client";
import { logger } from "@/src/shared/utils/logger";

import React from "react";
import { Card } from "@/src/design/baseComponents/Card";
import { Text } from "@/src/design/baseComponents/Text";
import { Stack } from "@/src/design/primitives/Stack";
import { Flex } from "@/src/design/primitives/Flex";
import { Badge } from "@/src/design/baseComponents/Badge";
import { View } from "@/src/design/primitives/View";
import { Collection } from "@/src/entities/collection";
import {
  Book,
  Heart,
  Trophy,
  Trash2,
  Edit,
  FolderPlus,
  Lock,
  Unlock,
  Cloud,
  AlertTriangle,
  WifiOff,
  Star,
} from "lucide-react";
import { useSafeRouter } from "@/src/shared/hooks/useSafeRouter";
import { Checkbox } from "@/src/design/baseComponents/Checkbox";
import { Button } from "@/src/design/baseComponents/Button";
import { addFavorite, removeFavorite } from "@/src/features/favorites/api";
import { useAuth } from "@/src/shared/auth/useAuth";
import { cn } from "@/src/shared/utils/cn";
import { useEffect, useState } from "react";
import { useSyncStatus } from "@/src/shared/hooks/useSyncStatus";
import { useNetworkStatus } from "@/src/shared/contexts/NetworkStatusContext";
import { syncManager } from "@/src/shared/api/SyncManager";
import { useCollectionMutations } from "../hooks/useCollectionMutations";
import { useToast } from "@/src/shared/contexts/ToastContext";

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
  displayMode?: "grid" | "list";
  isInteractionDisabled?: boolean;
  disabledReason?: string;
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
  displayMode = "list",
  isInteractionDisabled = false,
  disabledReason,
}: CollectionCardProps) {
  const router = useSafeRouter();
  const { isAuthenticated, user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { showToast } = useToast();
  const { updateCollection: doUpdateCollection } = useCollectionMutations();
  const [isFavoritedOverride, setIsFavoritedOverride] = useState<
    boolean | null
  >(null);
  const [favCountOverride, setFavCountOverride] = useState<number | null>(null);
  const [isOpenOverride, setIsOpenOverride] = useState<boolean | null>(null);
  const [isTogglingOpen, setIsTogglingOpen] = useState(false);
  const syncStatus = useSyncStatus(collection.id);
  const isPending = syncStatus?.isPending;
  const hasError = syncStatus?.hasError;
  const error = syncStatus?.error;
  const actionId = syncStatus?.actionId;

  const isOwner = user?.id === collection.userId;
  const isFavorited = isFavoritedOverride ?? (collection.isFavorited || false);
  const favCount = favCountOverride ?? (collection.favoriteCount || 0);
  const isOpen = isOpenOverride ?? collection.isOpen;
  const tags = collection.tags || [];
  const difficulty = collection.difficultyLevel ?? 3;
  const normalizedDifficulty = Math.max(1, Math.min(5, difficulty));

  const renderDifficultyStars = (size: number = 12) => {
    return (
      <Flex gap="none" align="center" title={`難易度 ${normalizedDifficulty}/5`}>
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = index < normalizedDifficulty;
          return (
            <Star
              key={`star-${index}`}
              size={size}
              className={cn(
                "transition-colors",
                filled
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-300 dark:text-slate-600",
              )}
            />
          );
        })}
      </Flex>
    );
  };

  // オフライン遷移のためにルートをプリフェッチ
  useEffect(() => {
    if (!isOnline) return;

    router.prefetch(`/collections/${collection.id}`);
    router.prefetch(`/collections/${collection.id}/ranking`);
  }, [router, collection.id, isOnline]);

  useEffect(() => {
    setIsOpenOverride(null);
  }, [collection.id, collection.isOpen]);

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
        setIsFavoritedOverride(false);
        setFavCountOverride((prev) => {
          const current = prev ?? (collection.favoriteCount || 0);
          return Math.max(0, current - 1);
        });
      } else {
        await addFavorite(collection.id);
        setIsFavoritedOverride(true);
        setFavCountOverride((prev) => {
          const current = prev ?? (collection.favoriteCount || 0);
          return current + 1;
        });
      }
    } catch (err) {
      logger.error("お気に入り操作に失敗しました", err);
    }
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/collections/search?q=${encodeURIComponent(`#${tag}`)}`);
  };

  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOwner || isTogglingOpen) {
      return;
    }

    const nextIsOpen = !isOpen;
    setIsTogglingOpen(true);
    try {
      await doUpdateCollection(collection.id, {
        name: collection.name,
        descriptionText: collection.descriptionText,
        isOpen: nextIsOpen,
        defaultMode: collection.defaultMode,
      });
      setIsOpenOverride(nextIsOpen);
      showToast({
        message: nextIsOpen
          ? isOnline
            ? "公開に変更しました"
            : "オフラインで公開設定を保存しました"
          : isOnline
            ? "非公開に変更しました"
            : "オフラインで非公開設定を保存しました",
        variant: "success",
      });
    } catch (err) {
      logger.error("公開状態の更新に失敗しました", err);
      showToast({ message: "公開設定の更新に失敗しました", variant: "danger" });
    } finally {
      setIsTogglingOpen(false);
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
          if (isInteractionDisabled) {
            e.preventDefault();
            e.stopPropagation();
            if (disabledReason) {
              showToast({ message: disabledReason, variant: "warning" });
            }
            return;
          }

          if (onClick) {
            onClick();
          } else {
            router.push(`/collections/${collection.id}`);
          }
        }}
        className={cn(
          "h-full",
          !isSelectionMode && !isInteractionDisabled && "cursor-pointer",
          !isSelectionMode && isInteractionDisabled && "cursor-not-allowed",
        )}
      >
        <Card
          border={
            hasError
              ? "danger"
              : isPending
                ? "warning"
                : displayMode === "list"
                  ? "none"
                  : "primary"
          }
          shadow={displayMode === "list" ? "none" : selected ? "lg" : "sm"}
          bg={
            displayMode === "list" ? "transparent" : selected ? "muted" : "card"
          }
          className={cn(
            "h-full transition-all duration-500 overflow-hidden relative",
            displayMode !== "list" &&
              !isInteractionDisabled &&
              "group-hover:shadow-lg group-hover:border-brand-primary/60 group-hover:-translate-y-0.5",
            selected &&
              displayMode !== "list" &&
              "ring-2 ring-brand-primary/20",
            isInteractionDisabled && "opacity-70",
            isPending &&
              !hasError &&
              "border-dashed border-amber-400/60 animate-pulse-subtle",
            hasError && "border-red-500/60 shadow-red-100/20",
          )}
        >
          {/* 同期ステータスアイコン */}
          {(isPending || hasError) && (
            <View className="absolute top-3 left-3 z-[10] flex items-center gap-1">
              {hasError ? (
                <Flex gap="xs">
                  <View
                    className="p-1 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    title={`同期エラー: ${error}`}
                  >
                    <AlertTriangle size={14} />
                  </View>
                  <View className="flex gap-1 animate-in fade-in slide-in-from-left-2">
                    <Button
                      size="sm"
                      variant="solid"
                      color="primary"
                      className="h-6 px-2 text-[10px] py-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (actionId) {
                          void syncManager.retryAction(actionId);
                        }
                      }}
                    >
                      再試行
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[10px] py-0 bg-white dark:bg-gray-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (actionId) {
                          void syncManager.discardAction(actionId);
                        }
                      }}
                    >
                      破棄
                    </Button>
                  </View>
                </Flex>
              ) : (
                <View
                  className="p-1 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 animate-bounce-subtle"
                  title="同期待ち..."
                >
                  <Cloud size={14} />
                </View>
              )}
            </View>
          )}

          {/* Checkbox moved into the title flex for better layout */}
          {/* 操作ボタン */}
          {displayMode !== "list" && (
            <View
              zIndex="docked"
              className="absolute top-3 right-3 flex gap-2 items-center"
            >
              {isOwner && (
                <Button
                  size="sm"
                  variant="soft"
                  rounded="full"
                  className={cn(
                    "p-2 rounded-full shadow-sm flex items-center justify-center border transition-colors",
                    isOpen
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                      : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
                  )}
                  title={isOpen ? "公開中（タップで非公開）" : "非公開（タップで公開）"}
                  onClick={handleToggleVisibility}
                  disabled={isTogglingOpen}
                >
                  {isOpen ? (
                    <Unlock size={14} strokeWidth={2.5} />
                  ) : (
                    <Lock size={14} strokeWidth={2.5} />
                  )}
                </Button>
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

          {displayMode === "list" ? (
            <Flex
              gap="md"
              align="center"
              justify="between"
              className={cn(
                "py-3 px-1 transition-colors group/list-item border-b border-surface-muted/50 last:border-b-0",
                selected && "bg-brand-primary/5",
              )}
            >
              <Flex gap="sm" align="center" className="flex-1 min-w-0">
                {(isSelectionMode || selectable) && (
                  <Checkbox
                    checked={selected}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelect?.(
                        collection.id,
                        collection.name,
                        collection.questionCount,
                      );
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={cn(
                      "transition-all",
                      selected
                        ? "scale-105"
                        : "opacity-70 group-hover/list-item:opacity-100",
                    )}
                  />
                )}
                <Stack gap="xs" className="flex-1 min-w-0">
                  <Text
                    weight={selected ? "bold" : "medium"}
                    variant="detail"
                    color={selected ? "primary" : "primary"}
                    className="truncate"
                  >
                    {collection.name}
                  </Text>
                  {tags.length > 0 && (
                    <Flex gap="xs" align="center" className="min-w-0">
                      {tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="info"
                          className="px-2 py-0 cursor-pointer"
                          onClick={(e) => handleTagClick(e, tag)}
                          title={`#${tag} で検索`}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </Flex>
                  )}
                  {isInteractionDisabled && disabledReason && (
                    <Text variant="xs" color="warning" className="truncate">
                      オフライン未保存
                    </Text>
                  )}
                </Stack>
              </Flex>

              <Flex gap="md" align="center" className="shrink-0">
                {!hideExtras && isOwner && (
                  <Flex
                    gap="xs"
                    className="opacity-0 group-hover/list-item:opacity-100 transition-opacity ml-2"
                  >
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

                <Flex className="w-[76px] justify-end">{renderDifficultyStars(11)}</Flex>
                <Flex
                  gap="xs"
                  align="center"
                  justify="end"
                  className="opacity-70 w-[58px]"
                >
                  <Book size={12} className="text-brand-primary" />
                  <Text variant="xs" color="secondary" className="tabular-nums">
                    {collection.questionCount || 0}
                  </Text>
                </Flex>
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
                      onSelect?.(
                        collection.id,
                        collection.name,
                        collection.questionCount,
                      );
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={cn(
                      "transition-all duration-300",
                      selected
                        ? "scale-110"
                        : "opacity-90 group-hover:opacity-100",
                    )}
                  />
                )}
                <Stack
                  gap="xs"
                  className={cn(
                    "flex-1 min-w-0",
                    (onEdit || onDelete || (onAddToSet && !hideExtras)) &&
                      "pr-32 sm:pr-40",
                  )}
                >
                  <Text
                    weight="bold"
                    variant="detail"
                    color="primary"
                    className="line-clamp-1 group-hover:opacity-100 transition-opacity opacity-90"
                  >
                    {collection.name}
                  </Text>
                  <Flex align="center" justify="between" className="min-w-0">
                    <Flex gap="xs" align="center" className="min-w-0">
                      <Text
                        variant="xs"
                        color="secondary"
                        className="font-medium opacity-80 truncate"
                      >
                        by {collection.authorName || "匿名"}
                      </Text>
                      {collection.isOfficial && (
                        <Badge variant="primary" className="px-2 py-0">
                          Official
                        </Badge>
                      )}
                      {isInteractionDisabled && (
                        <Badge variant="warning" className="px-2 py-0">
                          オフライン未保存
                        </Badge>
                      )}
                    </Flex>
                  </Flex>
                  {tags.length > 0 && (
                    <Flex gap="xs" align="center" className="min-w-0 flex-wrap">
                      {tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="info"
                          className="px-2 py-0 cursor-pointer"
                          onClick={(e) => handleTagClick(e, tag)}
                          title={`#${tag} で検索`}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </Stack>
              </Flex>

              {collection.descriptionText && (
                <Text
                  variant="xs"
                  color="secondary"
                  className="line-clamp-3 leading-relaxed opacity-90 min-h-[3rem]"
                >
                  {collection.descriptionText}
                </Text>
              )}

              <Flex
                justify="between"
                align="center"
                className="mt-auto pt-3 border-t border-surface-muted/50"
              >
                <Flex gap="lg" align="center">
                  <Flex gap="xs" align="center" title="問題数">
                    <Book
                      size={16}
                      strokeWidth={2.5}
                      className="text-brand-primary"
                    />
                    <Text variant="xs" weight="bold" color="primary">
                      {collection.questionCount || 0}
                    </Text>
                  </Flex>
                  <Flex
                    gap="xs"
                    align="center"
                    className={cn(
                      "transition-all cursor-pointer hover:scale-110 active:scale-95",
                      !isFavorited && "opacity-50",
                    )}
                    title="お気に入り"
                    onClick={handleFavoriteToggle}
                  >
                    <Heart
                      size={16}
                      strokeWidth={2.5}
                      className={cn(
                        isFavorited
                          ? "text-brand-heart fill-brand-heart"
                          : "text-brand-heart/80",
                      )}
                    />
                    <Text
                      variant="xs"
                      weight="bold"
                      color={isFavorited ? "danger" : "secondary"}
                    >
                      {favCount}
                    </Text>
                  </Flex>
                  <View className="shrink-0">{renderDifficultyStars(11)}</View>
                </Flex>

                <Flex gap="sm" align="center">
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
                    title={
                      isOnline
                        ? "ランキングを見る"
                        : "オフライン中はランキングを表示できません"
                    }
                  >
                    {isOnline ? (
                      <Trophy size={18} strokeWidth={2.5} />
                    ) : (
                      <WifiOff size={18} />
                    )}
                  </Button>
                  {collection.userRank && (
                    <Text variant="xs" weight="bold" color="primary" title="あなたのランキング順位">
                        {collection.userRank}位
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Stack>
          )}
        </Card>
      </View>
    </View>
  );
}
