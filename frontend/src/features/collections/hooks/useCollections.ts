import { Collection, CollectionSet } from '@/src/entities/collection';
import { getRecentCollections, getUserCollections, getFolloweeCollections, getUserCollectionSets } from '../api';
import { getAllOfflineCollections } from '@/src/shared/api/offlineApi';
import { mergePendingCollections, mergePendingSets } from '@/src/shared/api/mergePendingActions';
import { useSWRData } from '@/src/shared/hooks/useSWRData';
import { db } from '@/src/shared/db/db';
import { isOfflineError } from '@/src/shared/api/isOfflineError';
import { useState, useEffect } from 'react';
import { ApiError } from '@/src/shared/api/error';

/**
 * コレクション一覧をDexieに自動キャッシュするヘルパー
 */
async function cacheCollections(collections: Collection[]) {
    const savedAt = Date.now();
    for (const col of collections) {
        const existing = await db.collections.get(col.id);
        await db.collections.put({
            ...col,
            savedAt,
            isExplicitlySaved: existing?.isExplicitlySaved || false,
        });
    }
}

export function useRecentCollections(enabled: boolean = true) {
    const result = useSWRData<Collection[]>({
        cacheReader: async () => {
            const cached = await getAllOfflineCollections(false);
            if (cached.length === 0) return null;
            return await mergePendingCollections(cached);
        },
        fetcher: async () => {
            const data = await getRecentCollections();
            return await mergePendingCollections(data);
        },
        cacheWriter: cacheCollections,
        enabled,
    });

    return {
        collections: result.data || [],
        loading: result.loading,
        error: result.error,
        isOffline: result.isOffline,
        isStale: result.isStale,
        isRevalidating: result.isRevalidating,
        refresh: result.refresh,
    };
}

export function useUserCollections(userId: string | undefined) {
    const result = useSWRData<Collection[]>({
        cacheReader: async () => {
            if (!userId) return null;
            const allOffline = await getAllOfflineCollections(false);
            const filtered = allOffline.filter(c => c.userId === userId);
            if (filtered.length === 0) return null;
            return await mergePendingCollections(filtered);
        },
        fetcher: async () => {
            if (!userId) return [];
            const data = await getUserCollections(userId);
            return await mergePendingCollections(data);
        },
        cacheWriter: cacheCollections,
        enabled: !!userId,
        deps: [userId],
    });

    return {
        collections: result.data || [],
        loading: result.loading,
        error: result.error,
        isOffline: result.isOffline,
        isStale: result.isStale,
        isRevalidating: result.isRevalidating,
        refresh: result.refresh,
    };
}

export function useFolloweeCollections(enabled: boolean = true) {
    const result = useSWRData<Collection[]>({
        cacheReader: async () => {
            const cached = await getAllOfflineCollections(false);
            if (cached.length === 0) return null;
            return await mergePendingCollections(cached);
        },
        fetcher: async () => {
            const data = await getFolloweeCollections();
            return await mergePendingCollections(data);
        },
        cacheWriter: cacheCollections,
        enabled,
    });

    return {
        collections: result.data || [],
        loading: result.loading,
        error: result.error,
        isOffline: result.isOffline,
        isStale: result.isStale,
        isRevalidating: result.isRevalidating,
        refresh: result.refresh,
    };
}

export function useUserCollectionSets(userId: string | undefined) {
    const [collectionSets, setCollectionSets] = useState<CollectionSet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    const refresh = async () => {
        if (!userId) return;
        setLoading(true);
        setIsOffline(false);
        try {
            const data = await getUserCollectionSets(userId);
            const merged = await mergePendingSets(data, userId);
            setCollectionSets(merged);
            setError(null);
        } catch (err) {
            if (isOfflineError(err)) {
                setIsOffline(true);
                const merged = await mergePendingSets(collectionSets, userId);
                setCollectionSets(merged);
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch collection sets');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [userId]);

    return { collectionSets, loading, error, isOffline, refresh };
}
