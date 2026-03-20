import { useState, useEffect, useCallback, useRef } from "react";
import { isOfflineError } from "@/src/shared/api/isOfflineError";
import { logger } from "@/src/shared/utils/logger";

interface SWROptions<T> {
  /** Dexie キャッシュからデータを読み取る関数 */
  cacheReader: () => Promise<T | null>;
  /** API からデータを取得する関数 */
  fetcher: () => Promise<T>;
  /** API 成功時にキャッシュを書き込む関数 */
  cacheWriter: (data: T) => Promise<void>;
  /** フックを有効にする条件（false で実行しない） */
  enabled?: boolean;
  /** 依存配列 — 変更されたら再フェッチ */
  deps?: unknown[];
}

interface SWRResult<T> {
  /** 現在のデータ（キャッシュまたはAPI取得） */
  data: T | null;
  /** 初回ロード中（キャッシュもAPIもまだ） */
  loading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** データがキャッシュ由来で、APIからの確認がまだの場合 true */
  isStale: boolean;
  /** オフライン状態の場合 true */
  isOffline: boolean;
  /** API からの再フェッチ中の場合 true */
  isRevalidating: boolean;
  /** 手動で再フェッチするための関数 */
  refresh: () => Promise<void>;
}

/**
 * Network-First + Offline Fallback パターンの汎用フック。
 *
 * 1. 非同期で fetcher() を開始
 * 2. API 成功時: cacheWriter() でキャッシュ更新 + UI 更新
 * 3. オフライン/ネットワーク失敗時のみ cacheReader() でフォールバック表示
 */
export function useSWRData<T>(options: SWROptions<T>): SWRResult<T> {
  const { cacheReader, fetcher, cacheWriter, enabled = true, deps = [] } =
    options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  // fetcherのref化（deps変更時に最新を使うため）
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const cacheReaderRef = useRef(cacheReader);
  cacheReaderRef.current = cacheReader;
  const cacheWriterRef = useRef(cacheWriter);
  cacheWriterRef.current = cacheWriter;
  const dataRef = useRef<T | null>(null);
  dataRef.current = data;

  const refresh = useCallback(async () => {
    if (!enabled) return;

    let hasAnyData = dataRef.current != null;

    // Step 1: APIからの取得を開始（バックグラウンド）
    setIsRevalidating(true);
    setIsOffline(false);
    setError(null);

    try {
      const freshData = await fetcherRef.current();
      hasAnyData = true;
      setData(freshData);
      setIsStale(false);
      setError(null);
      setIsOffline(false);

      cacheWriterRef
        .current(freshData)
        .catch((e) => logger.error("SWR: キャッシュ書き込みエラー", e));
    } catch (err) {
      if (isOfflineError(err)) {
        setIsOffline(true);
        if (!hasAnyData) {
          try {
            const cached = await cacheReaderRef.current();
            if (cached != null) {
              setData(cached);
              setIsStale(true);
              setError(null);
            } else {
              setError(
                "ネットワークまたはサーバーに接続できず、キャッシュもないためデータを表示できません。",
              );
            }
          } catch {
            setError("ネットワークまたはサーバーに接続できません。");
          }
        }
      } else if (!hasAnyData) {
        setError(
          err instanceof Error ? err.message : "データの取得に失敗しました",
        );
      }
    } finally {
      setIsRevalidating(false);
      setLoading(false);
    }
  }, [enabled, ...deps]);

  useEffect(() => {
    if (enabled) {
      setLoading(true);
      refresh();
    }
  }, [enabled, ...deps]);

  return { data, loading, error, isStale, isOffline, isRevalidating, refresh };
}
