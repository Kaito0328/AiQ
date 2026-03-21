"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Container } from "@/src/design/primitives/Container";
import { View } from "@/src/design/primitives/View";
import { Stack } from "@/src/design/primitives/Stack";
import { Card } from "@/src/design/baseComponents/Card";
import { Text } from "@/src/design/baseComponents/Text";
import { Input } from "@/src/design/baseComponents/Input";
import { Select } from "@/src/design/baseComponents/Select";
import { Button } from "@/src/design/baseComponents/Button";
import { Flex } from "@/src/design/primitives/Flex";
import { Grid } from "@/src/design/primitives/Grid";
import { Spinner } from "@/src/design/baseComponents/Spinner";
import { CollectionCard } from "@/src/features/collections/components/CollectionCard";
import { searchCollections } from "@/src/features/collections/api";
import { Collection } from "@/src/entities/collection";
import { getAllOfflineCollections } from "@/src/shared/api/offlineApi";
import { isOfflineError } from "@/src/shared/api/isOfflineError";
import { CollectionDetailPageContent } from "@/src/features/collections/components/CollectionDetailPageContent";
import { db } from "@/src/shared/db/db";
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  WifiOff,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZE = 24;

type SortOption = "new" | "popular" | "difficultyAsc" | "difficultyDesc";
type DifficultyMode = "none" | "exact" | "atLeast" | "atMost";
type ViewMode = "grid" | "list";
type AppliedSearch = {
  rawQuery: string;
  sort: SortOption;
  difficultyMode: DifficultyMode;
  difficultyLevel: string;
};

function normalizeSort(value: string | null): SortOption {
  if (
    value === "new" ||
    value === "popular" ||
    value === "difficultyAsc" ||
    value === "difficultyDesc"
  ) {
    return value;
  }
  return "popular";
}

function normalizeDifficultyMode(value: string | null): DifficultyMode {
  if (
    value === "none" ||
    value === "exact" ||
    value === "atLeast" ||
    value === "atMost"
  ) {
    return value;
  }
  return "none";
}

function normalizeDifficultyLevel(value: string | null): string {
  if (
    value === "1" ||
    value === "2" ||
    value === "3" ||
    value === "4" ||
    value === "5"
  ) {
    return value;
  }
  return "3";
}

function normalizeViewMode(value: string | null): ViewMode {
  if (value === "grid" || value === "list") {
    return value;
  }
  return "grid";
}

function buildSearchQueryString(params: {
  query: string;
  sort: SortOption;
  difficultyMode: DifficultyMode;
  difficultyLevel: string;
  viewMode: ViewMode;
}): string {
  const qs = new URLSearchParams();

  const trimmedQuery = params.query.trim();
  if (trimmedQuery) {
    qs.set("q", trimmedQuery);
  }
  if (params.sort !== "popular") {
    qs.set("sort", params.sort);
  }
  if (params.difficultyMode !== "none") {
    qs.set("difficultyMode", params.difficultyMode);
    qs.set("difficultyLevel", params.difficultyLevel);
  }
  if (params.viewMode !== "grid") {
    qs.set("view", params.viewMode);
  }

  return qs.toString();
}

function parseQuery(raw: string): { textQuery?: string; tagTerms?: string[] } {
  const parts = raw
    .trim()
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const tagTerms: string[] = [];
  const textParts: string[] = [];

  for (const part of parts) {
    if (part.startsWith("#") || part.startsWith("＃")) {
      const normalized = part.replace(/^[#＃]+/, "").toLowerCase();
      if (normalized) {
        tagTerms.push(normalized);
      }
      continue;
    }
    textParts.push(part);
  }

  return {
    textQuery: textParts.length > 0 ? textParts.join(" ") : undefined,
    tagTerms: tagTerms.length > 0 ? tagTerms : undefined,
  };
}

function applyOfflineFilters(
  collections: Collection[],
  params: {
    textQuery?: string;
    tagTerms?: string[];
    sort: SortOption;
    difficultyMode: DifficultyMode;
    difficultyLevel: number;
  },
): Collection[] {
  let filtered = collections;

  if (params.textQuery) {
    const q = params.textQuery.toLowerCase();
    filtered = filtered.filter((c) => {
      const haystacks = [
        c.name,
        c.descriptionText,
        c.authorName,
        ...(c.tags || []),
      ]
        .filter(Boolean)
        .map((v) => v!.toLowerCase());
      return haystacks.some((v) => v.includes(q));
    });
  }

  if (params.tagTerms && params.tagTerms.length > 0) {
    filtered = filtered.filter((c) => {
      const tags = (c.tags || []).map((tag) => tag.toLowerCase());
      return params.tagTerms!.every((t) => tags.includes(t));
    });
  }

  if (params.difficultyMode !== "none") {
    filtered = filtered.filter((c) => {
      const level = c.difficultyLevel;
      if (typeof level !== "number") return false;

      if (params.difficultyMode === "exact") {
        return level === params.difficultyLevel;
      }
      if (params.difficultyMode === "atLeast") {
        return level >= params.difficultyLevel;
      }
      return level <= params.difficultyLevel;
    });
  }

  const sorted = [...filtered];
  if (params.sort === "popular") {
    sorted.sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0));
  } else if (params.sort === "new") {
    sorted.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime(),
    );
  } else if (params.sort === "difficultyAsc") {
    sorted.sort((a, b) => (a.difficultyLevel || 3) - (b.difficultyLevel || 3));
  } else if (params.sort === "difficultyDesc") {
    sorted.sort((a, b) => (b.difficultyLevel || 3) - (a.difficultyLevel || 3));
  }

  return sorted;
}

function getOfflineCollectionIdFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith("#")) return null;
  const params = new URLSearchParams(hash.slice(1));
  return params.get("offlineCollectionId");
}

function CollectionSearchPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [offlineCollectionIdFromHash, setOfflineCollectionIdFromHash] =
    useState<string | null>(() => getOfflineCollectionIdFromHash());

  useEffect(() => {
    const syncFromHash = () => {
      setOfflineCollectionIdFromHash(getOfflineCollectionIdFromHash());
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const offlineCollectionId =
    offlineCollectionIdFromHash ?? searchParams.get("offlineCollectionId");

  if (offlineCollectionId) {
    return <CollectionDetailPageContent collectionId={offlineCollectionId} />;
  }

  const initialQuery = searchParams.get("q")?.trim() ?? "";
  const initialSort = normalizeSort(searchParams.get("sort"));
  const initialDifficultyMode = normalizeDifficultyMode(
    searchParams.get("difficultyMode"),
  );
  const initialDifficultyLevel = normalizeDifficultyLevel(
    searchParams.get("difficultyLevel"),
  );
  const initialViewMode = normalizeViewMode(searchParams.get("view"));

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>(
    initialDifficultyMode,
  );
  const [difficultyLevel, setDifficultyLevel] = useState<string>(
    initialDifficultyLevel,
  );
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  const [results, setResults] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [showOfflineCacheBadge, setShowOfflineCacheBadge] = useState(false);
  const [showOfflineReadyOnly, setShowOfflineReadyOnly] = useState(true);
  const [offlineReadyCollectionIds, setOfflineReadyCollectionIds] = useState<
    Set<string>
  >(new Set());
  const [offlineUnavailableCount, setOfflineUnavailableCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [appliedSearch, setAppliedSearch] = useState<AppliedSearch>({
    rawQuery: initialQuery,
    sort: initialSort,
    difficultyMode: initialDifficultyMode,
    difficultyLevel: initialDifficultyLevel,
  });

  const executeSearch = useCallback(
    async (params: {
      rawQuery: string;
      sortValue: SortOption;
      difficultyModeValue: DifficultyMode;
      difficultyLevelValue: string;
      offset: number;
      append: boolean;
      updateUrl: boolean;
      offlineReadyOnlyOverride?: boolean;
    }) => {
      const { textQuery, tagTerms } = parseQuery(params.rawQuery);

      if (params.updateUrl) {
        const qs = buildSearchQueryString({
          query: params.rawQuery,
          sort: params.sortValue,
          difficultyMode: params.difficultyModeValue,
          difficultyLevel: params.difficultyLevelValue,
          viewMode,
        });
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      }

      if (params.append) {
        setLoadingMore(true);
        setLoadMoreError(null);
      } else {
        setLoading(true);
        setError(null);
        setLoadMoreError(null);
      }

      try {
        const data = await searchCollections({
          q: textQuery,
          tags: tagTerms,
          difficultyLevel:
            params.difficultyModeValue === "none"
              ? undefined
              : Number(params.difficultyLevelValue),
          difficultyMode:
            params.difficultyModeValue === "none"
              ? undefined
              : params.difficultyModeValue,
          sort: params.sortValue,
          limit: PAGE_SIZE,
          offset: params.offset,
        });

        setHasMore(data.length === PAGE_SIZE);
        setShowOfflineCacheBadge(false);
        setOfflineReadyCollectionIds(new Set());
        setOfflineUnavailableCount(0);
        if (params.append) {
          setResults((prev) => [...prev, ...data]);
        } else {
          setResults(data);
        }
      } catch (err) {
        try {
          const offlineCollections = await getAllOfflineCollections(false);
          const filteredOffline = applyOfflineFilters(offlineCollections, {
            textQuery,
            tagTerms,
            sort: params.sortValue,
            difficultyMode: params.difficultyModeValue,
            difficultyLevel: Number(params.difficultyLevelValue),
          });

          const ids = filteredOffline.map((c) => c.id);
          const cachedQuestions =
            ids.length > 0
              ? await db.questions.where("collectionId").anyOf(ids).toArray()
              : [];
          const readyIds = new Set(cachedQuestions.map((q) => q.collectionId));
          const unavailableCount = filteredOffline.filter(
            (c) => !readyIds.has(c.id),
          ).length;

          const showReadyOnly =
            params.offlineReadyOnlyOverride ?? showOfflineReadyOnly;
          const effectiveOffline = showReadyOnly
            ? filteredOffline.filter((c) => readyIds.has(c.id))
            : filteredOffline;

          const sliced = effectiveOffline.slice(
            params.offset,
            params.offset + PAGE_SIZE,
          );

          setHasMore(params.offset + PAGE_SIZE < effectiveOffline.length);
          setShowOfflineCacheBadge(true);
          setOfflineReadyCollectionIds(readyIds);
          setOfflineUnavailableCount(unavailableCount);
          if (params.append) {
            setResults((prev) => [...prev, ...sliced]);
          } else {
            setResults(sliced);
            setError(null);
          }
          return;
        } catch {
          // keep original error handling below
        }

        if (params.append) {
          setLoadMoreError("追加読み込みに失敗しました。再試行してください。");
        } else {
          setError(
            isOfflineError(err)
              ? "オフラインのため検索できません。"
              : "検索に失敗しました。時間をおいて再試行してください。",
          );
          setResults([]);
          setHasMore(false);
          setShowOfflineCacheBadge(false);
          setOfflineReadyCollectionIds(new Set());
          setOfflineUnavailableCount(0);
        }
      } finally {
        if (params.append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [pathname, router, showOfflineReadyOnly, viewMode],
  );

  useEffect(() => {
    if (initialized) {
      return;
    }

    void executeSearch({
      rawQuery: initialQuery,
      sortValue: initialSort,
      difficultyModeValue: initialDifficultyMode,
      difficultyLevelValue: initialDifficultyLevel,
      offset: 0,
      append: false,
      updateUrl: false,
    });
    setAppliedSearch({
      rawQuery: initialQuery,
      sort: initialSort,
      difficultyMode: initialDifficultyMode,
      difficultyLevel: initialDifficultyLevel,
    });
    setInitialized(true);
  }, [
    executeSearch,
    initialDifficultyLevel,
    initialDifficultyMode,
    initialQuery,
    initialSort,
    initialized,
  ]);

  const handleSearch = useCallback(() => {
    void executeSearch({
      rawQuery: query,
      sortValue: sort,
      difficultyModeValue: difficultyMode,
      difficultyLevelValue: difficultyLevel,
      offset: 0,
      append: false,
      updateUrl: true,
    });
    setAppliedSearch({
      rawQuery: query,
      sort,
      difficultyMode,
      difficultyLevel,
    });
  }, [difficultyLevel, difficultyMode, executeSearch, query, sort]);

  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) {
      return;
    }

    void executeSearch({
      rawQuery: appliedSearch.rawQuery,
      sortValue: appliedSearch.sort,
      difficultyModeValue: appliedSearch.difficultyMode,
      difficultyLevelValue: appliedSearch.difficultyLevel,
      offset: results.length,
      append: true,
      updateUrl: false,
    });
  }, [
    appliedSearch.difficultyLevel,
    appliedSearch.difficultyMode,
    appliedSearch.rawQuery,
    appliedSearch.sort,
    executeSearch,
    hasMore,
    loading,
    loadingMore,
    results.length,
  ]);

  const handleViewModeChange = useCallback(
    (nextViewMode: ViewMode) => {
      setViewMode(nextViewMode);

      const qs = buildSearchQueryString({
        query: appliedSearch.rawQuery,
        sort: appliedSearch.sort,
        difficultyMode: appliedSearch.difficultyMode,
        difficultyLevel: appliedSearch.difficultyLevel,
        viewMode: nextViewMode,
      });
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [
      appliedSearch.difficultyLevel,
      appliedSearch.difficultyMode,
      appliedSearch.rawQuery,
      appliedSearch.sort,
      pathname,
      router,
    ],
  );

  const handleToggleOfflineReadyOnly = useCallback(() => {
    const next = !showOfflineReadyOnly;
    setShowOfflineReadyOnly(next);

    void executeSearch({
      rawQuery: appliedSearch.rawQuery,
      sortValue: appliedSearch.sort,
      difficultyModeValue: appliedSearch.difficultyMode,
      difficultyLevelValue: appliedSearch.difficultyLevel,
      offset: 0,
      append: false,
      updateUrl: false,
      offlineReadyOnlyOverride: next,
    });
  }, [
    appliedSearch.difficultyLevel,
    appliedSearch.difficultyMode,
    appliedSearch.rawQuery,
    appliedSearch.sort,
    executeSearch,
    showOfflineReadyOnly,
  ]);

  if (offlineCollectionId) {
    return <CollectionDetailPageContent collectionId={offlineCollectionId} />;
  }

  return (
    <View className="min-h-screen bg-surface-muted pt-4 pb-20 sm:py-8">
      <Container className="px-3 sm:px-6 lg:px-8">
        <Stack gap="md">
          <Stack gap="xs">
            <Flex gap="sm" align="center">
              <Text variant="h4" weight="bold" className="tracking-tight">
                コレクション検索
              </Text>
              {showOfflineCacheBadge && (
                <Flex
                  gap="xs"
                  align="center"
                  className="text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full"
                >
                  <WifiOff size={12} />
                  <Text variant="xs" weight="bold" className="text-amber-700">
                    オフライン
                  </Text>
                </Flex>
              )}
              {showOfflineCacheBadge && offlineUnavailableCount > 0 && (
                <Button
                  size="sm"
                  variant={showOfflineReadyOnly ? "solid" : "outline"}
                  color="primary"
                  className="h-7 px-2 text-xs"
                  onClick={handleToggleOfflineReadyOnly}
                >
                  {showOfflineReadyOnly ? "すべて表示" : "利用可能のみ"}
                </Button>
              )}
            </Flex>
          </Stack>

          {showOfflineCacheBadge && offlineUnavailableCount > 0 && (
            <Text variant="xs" color="secondary">
              問題未キャッシュの {offlineUnavailableCount} 件があります。
              {showOfflineReadyOnly
                ? " 現在はアクセス可能なコレクションのみ表示しています。"
                : " 未キャッシュのコレクションはタップできません。"}
            </Text>
          )}

          <Stack gap="xs">
            <Flex gap="xs" align="center">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例: #英語 単語"
                className="w-full !text-sm !py-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                className="h-10 w-10 min-w-10 p-0"
                color="primary"
                title="検索"
                aria-label="検索"
              >
                <Search size={16} />
              </Button>
            </Flex>

            <View className="overflow-x-auto -mx-1 px-1">
              <Flex
                gap="xs"
                align="center"
                className="min-w-max flex-nowrap py-0.5"
              >
                <View className="text-secondary shrink-0">
                  <ArrowUpDown size={16} />
                </View>
                <Select
                  value={sort}
                  onChange={(e) =>
                    setSort(
                      e.target.value as
                        | "new"
                        | "popular"
                        | "difficultyAsc"
                        | "difficultyDesc",
                    )
                  }
                  className="!text-sm !py-2"
                >
                  <option value="popular">人気</option>
                  <option value="new">新着</option>
                  <option value="difficultyAsc">易→難</option>
                  <option value="difficultyDesc">難→易</option>
                </Select>
                <View className="w-2 shrink-0" />
                <View className="text-secondary shrink-0">
                  <SlidersHorizontal size={16} />
                </View>
                <Select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                  className="min-w-[94px] flex-1 !text-sm !py-2"
                >
                  <option value="1">Lv1</option>
                  <option value="2">Lv2</option>
                  <option value="3">Lv3</option>
                  <option value="4">Lv4</option>
                  <option value="5">Lv5</option>
                </Select>
                <Select
                  value={difficultyMode}
                  onChange={(e) =>
                    setDifficultyMode(
                      e.target.value as "none" | "exact" | "atLeast" | "atMost",
                    )
                  }
                  className="min-w-[94px] flex-1 !text-sm !py-2"
                >
                  <option value="none">指定なし</option>
                  <option value="exact">一致</option>
                  <option value="atLeast">以上</option>
                  <option value="atMost">以下</option>
                </Select>
              </Flex>
            </View>
          </Stack>

          <Flex justify="between" align="center" className="pt-1">
            <Text variant="detail" color="secondary" weight="bold">
              表示中 {results.length} 件
            </Text>
            <Flex gap="sm" align="center">
              <Flex
                gap="xs"
                align="center"
                className="bg-surface-muted/50 p-1 rounded-lg border border-surface-muted"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 transition-all",
                    viewMode === "grid"
                      ? "bg-surface-base shadow-sm text-brand-primary"
                      : "text-secondary",
                  )}
                  onClick={() => handleViewModeChange("grid")}
                  title="グリッド表示"
                >
                  <LayoutGrid size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 transition-all",
                    viewMode === "list"
                      ? "bg-surface-base shadow-sm text-brand-primary"
                      : "text-secondary",
                  )}
                  onClick={() => handleViewModeChange("list")}
                  title="インライン表示"
                >
                  <List size={16} />
                </Button>
              </Flex>
            </Flex>
          </Flex>

          {loading && results.length === 0 ? (
            <View className="py-10 flex justify-center">
              <Spinner size="lg" />
            </View>
          ) : error && results.length === 0 ? (
            <Card border="danger" bg="card">
              <Text color="danger" align="center">
                {error}
              </Text>
            </Card>
          ) : results.length === 0 ? (
            <Card border="base" bg="card">
              <Text color="secondary" align="center">
                条件に一致するコレクションがありません
              </Text>
            </Card>
          ) : viewMode === "list" ? (
            <Stack
              gap="none"
              className="border border-surface-muted/30 rounded-xl overflow-hidden bg-surface-muted/5"
            >
              {results.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  displayMode="list"
                  isInteractionDisabled={
                    showOfflineCacheBadge &&
                    !offlineReadyCollectionIds.has(collection.id)
                  }
                  disabledReason="このコレクションの問題は未キャッシュです。オンライン時に詳細を開いて保存してください。"
                />
              ))}
            </Stack>
          ) : (
            <Grid cols={{ base: 1, md: 2, lg: 2, xl: 3 }} gap="md">
              {results.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  displayMode="grid"
                  isInteractionDisabled={
                    showOfflineCacheBadge &&
                    !offlineReadyCollectionIds.has(collection.id)
                  }
                  disabledReason="このコレクションの問題は未キャッシュです。オンライン時に詳細を開いて保存してください。"
                />
              ))}
            </Grid>
          )}

          {results.length > 0 ? (
            <Stack gap="xs" className="pt-2">
              {loadMoreError ? (
                <Text variant="detail" color="danger" align="center">
                  {loadMoreError}
                </Text>
              ) : null}

              {hasMore ? (
                <Flex justify="center">
                  <Button
                    variant="outline"
                    color="secondary"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "読み込み中..." : "もっと見る"}
                  </Button>
                </Flex>
              ) : (
                <Text variant="detail" color="secondary" align="center">
                  すべて表示しました
                </Text>
              )}
            </Stack>
          ) : null}
        </Stack>
      </Container>
    </View>
  );
}

export default function CollectionSearchPage() {
  return (
    <Suspense
      fallback={
        <View className="min-h-screen bg-surface-muted pt-4 pb-20 sm:py-8">
          <Container className="px-3 sm:px-6 lg:px-8">
            <View className="py-10 flex justify-center">
              <Spinner size="lg" />
            </View>
          </Container>
        </View>
      }
    >
      <CollectionSearchPageContent />
    </Suspense>
  );
}
