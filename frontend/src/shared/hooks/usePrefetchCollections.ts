import { useEffect, useRef } from 'react';
import { Collection } from '@/src/entities/collection';
import { getCollectionQuestions } from '@/src/features/questions/api';
import { syncCollectionToOffline } from '@/src/shared/api/offlineApi';
import { logger } from '@/src/shared/utils/logger';

/**
 * ユーザーのコレクション一覧が取得済みの場合、
 * バックグラウンドで各コレクションの問題をプリフェッチしてDexieにキャッシュする。
 *
 * - ページ遷移時にAbortControllerでキャンセル
 * - 同時フェッチ数を制限（2並列）
 * - 優先度: ユーザーが既にアクセス中のリクエストを妨げない
 */
export function usePrefetchCollections(collections: Collection[], enabled: boolean = true) {
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!enabled || collections.length === 0) return;

        // 前回のプリフェッチをキャンセル
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const prefetch = async () => {
            // 同時2並列で順次プリフェッチ
            const CONCURRENCY = 2;
            const queue = [...collections];

            const worker = async () => {
                while (queue.length > 0) {
                    if (controller.signal.aborted) return;
                    const col = queue.shift();
                    if (!col) return;

                    try {
                        const questions = await getCollectionQuestions(col.id);
                        if (controller.signal.aborted) return;
                        // Dexie にキャッシュ (明示保存フラグはfalse)
                        await syncCollectionToOffline(col, questions, false);
                    } catch {
                        // プリフェッチ失敗は無視（ユーザーに影響なし）
                    }
                }
            };

            // CONCURRENCY数だけworkerを並行起動
            const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker());
            await Promise.allSettled(workers);
        };

        // 少し遅延させて、メインのデータ取得を優先
        const timerId = setTimeout(() => {
            prefetch().catch(e => logger.error('Prefetch failed', e));
        }, 1000);

        return () => {
            clearTimeout(timerId);
            controller.abort();
        };
    }, [collections, enabled]);
}
