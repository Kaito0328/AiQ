import { useState, useCallback, useEffect } from 'react';
import { Collection } from '@/src/entities/collection';
import { getCollectionQuestions } from '@/src/features/questions/api';
import { syncCollectionToOffline, getOfflineCollection } from '@/src/shared/api/offlineApi';
import { db } from '@/src/shared/db/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function useCollectionOffline(collection: Collection | undefined) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // IndexedDB の状態をリアルタイムで監視
    const offlineCollection = useLiveQuery(
        async () => {
            if (!collection?.id) return undefined;
            return await db.collections.get(collection.id);
        },
        [collection?.id]
    );

    const isOfflineAvailable = !!offlineCollection?.isExplicitlySaved;

    const downloadCollection = useCallback(async () => {
        if (!collection) return;

        setIsSyncing(true);
        setError(null);

        try {
            // 最新の問題一覧を取得
            const questions = await getCollectionQuestions(collection.id);
            // ローカルに保存
            await syncCollectionToOffline(collection, questions);
        } catch (e) {
            console.error('Failed to sync collection for offline:', e);
            setError(e instanceof Error ? e : new Error('不明なエラーが発生しました'));
        } finally {
            setIsSyncing(false);
        }
    }, [collection]);

    const removeOffline = useCallback(async () => {
        if (!collection?.id) return;
        await db.deleteCollectionContent(collection.id);
    }, [collection?.id]);

    return {
        isOfflineAvailable,
        isSyncing,
        error,
        downloadCollection,
        removeOffline,
        lastSyncedAt: offlineCollection?.savedAt
    };
}
