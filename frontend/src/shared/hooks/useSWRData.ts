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
  /**
   * キャッシュを表示するまでの待機時間（ミリ秒、デフォルト 200ms）。
   * APIがこの時間内に完了した場合はキャッシュを表示せず、チラつきを防止します。
   */
  displayThreshold?: number;
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
 * Stale-While-Revalidate パターンの汎用フック。
 *
 * 1. 非同期で fetcher() を開始
 * 2. displayThreshold 待機し、まだ API が未完了なら cacheReader() の値を表示
 * 3. API 成功時: cacheWriter() でキャッシュ更新 + UI 更新
 * 4. 失敗時: キャッシュデータを維持
 */
export function useSWRData<T>(options: SWROptions<T>): SWRResult<T> {
  const {
    cacheReader,
    fetcher,
    cacheWriter,
    enabled = true,
    displayThreshold = 200,
    deps = [],
  } = options;

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

  const refresh = useCallback(async () => {
    if (!enabled) return;

    let isApiDone = false;
    let hasShownCache = false;
    let hasFreshData = false;
    let hasAnyData = data != null;

    // Step 1: APIからの取得を開始（バックグラウンド）
    setIsRevalidating(true);
    setIsOffline(false);
    setError(null);

    const apiPromise = (async () => {
      try {
        const freshData = await fetcherRef.current();
        isApiDone = true;
        hasFreshData = true;
        hasAnyData = true;
        setData(freshData);
        setIsStale(false);
        setError(null);
        setIsOffline(false);

        // キャッシュ更新
        cacheWriterRef
          .current(freshData)
          .catch((e) => logger.error("SWR: キャッシュ書き込みエラー", e));
      } catch (err) {
        isApiDone = true;
        if (isOfflineError(err)) {
          setIsOffline(true);
          // キャッシュが未表示なら表示を試みる（オフラインなら即座に表示して良い）
          if (!hasAnyData) {
            try {
              const cached = await cacheReaderRef.current();
              if (cached != null) {
                hasAnyData = true;
                setData(cached);
                setIsStale(true);
              } else {
                setError(
                  "ネットワークまたはサーバーに接続できません。データを利用するには一度正常接続で読み込む必要があります。",
                );
              }
            } catch {
              setError("ネットワークまたはサーバーに接続できません。");
            }
          }
        } else {
          // APIエラー時もキャッシュがあれば表示を維持
          if (!hasAnyData) {
            setError(
              err instanceof Error ? err.message : "データの取得に失敗しました",
            );
          }
        }
      } finally {
        setIsRevalidating(false);
        setLoading(false);
      }
    })();

    // Step 2: 少し待機してからキャッシュを表示（チラつき防止）
    // オフラインでない（接続中）と思われる場合のみ待機
    if (typeof navigator !== "undefined" && navigator.onLine) {
      setTimeout(async () => {
        if (!isApiDone && !hasShownCache) {
          try {
            const cached = await cacheReaderRef.current();
            if (cached != null && !hasFreshData && !hasShownCache) {
              hasAnyData = true;
              setData(cached);
              setIsStale(true);
              setLoading(false);
              hasShownCache = true;
            }
          } catch (err) {
            logger.error("SWR: キャッシュ読み込みエラー", err);
          }
        }
      }, displayThreshold);
    } else {
      // オフライン時は即座にキャッシュ表示を試みる
      try {
        const cached = await cacheReaderRef.current();
        if (cached != null && !hasFreshData && !hasShownCache) {
          hasAnyData = true;
          setData(cached);
          setIsStale(true);
          setLoading(false);
          hasShownCache = true;
        } else {
          // キャッシュもない場合は即座にロード中を解除しオフラインエラー
          setLoading(false);
          setError(
            "ネットワークまたはサーバーに接続できず、キャッシュもないためデータを表示できません。",
          );
          setIsOffline(true);
        }
      } catch (e) {
        setLoading(false);
        setIsOffline(true);
      }
    }

    await apiPromise;
  }, [enabled, displayThreshold, ...deps]);

  useEffect(() => {
    if (enabled) {
      setLoading(true);
      refresh();
    }
  }, [enabled, ...deps]);

  return { data, loading, error, isStale, isOffline, isRevalidating, refresh };
}
