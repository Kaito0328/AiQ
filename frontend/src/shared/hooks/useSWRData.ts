import { useState, useEffect, useCallback, useRef } from 'react';
import { isOfflineError } from '@/src/shared/api/isOfflineError';
import { logger } from '@/src/shared/utils/logger';

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
    deps?: any[];
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
 * 1. まず cacheReader() でキャッシュを即座に表示
 * 2. 非同期で fetcher() を実行
 * 3. 成功時: cacheWriter() でキャッシュ更新 + UI 更新
 * 4. 失敗時: キャッシュデータを維持
 */
export function useSWRData<T>(options: SWROptions<T>): SWRResult<T> {
    const { cacheReader, fetcher, cacheWriter, enabled = true, deps = [] } = options;

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

        // Step 1: キャッシュの読み込み
        let hasCachedData = false;
        try {
            const cached = await cacheReaderRef.current();
            if (cached !== null) {
                setData(cached);
                setIsStale(true);
                setLoading(false);
                hasCachedData = true;
            }
        } catch (e) {
            logger.error('SWR: キャッシュ読み込みエラー', e);
        }

        // Step 2: APIからの取得（バックグラウンド）
        setIsRevalidating(true);
        setIsOffline(false);
        setError(null);

        try {
            const freshData = await fetcherRef.current();
            setData(freshData);
            setIsStale(false);
            setError(null);
            setIsOffline(false);

            // キャッシュ更新（非同期で良い）
            cacheWriterRef.current(freshData).catch(e =>
                logger.error('SWR: キャッシュ書き込みエラー', e)
            );
        } catch (err) {
            if (isOfflineError(err)) {
                setIsOffline(true);
                // キャッシュデータがあればそのまま使い続ける
                if (!hasCachedData) {
                    setError('オフラインです。データを利用するには一度オンラインで読み込む必要があります。');
                }
            } else {
                if (!hasCachedData) {
                    setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
                }
                // キャッシュデータがある場合はエラーを表示しない（stale のまま）
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
