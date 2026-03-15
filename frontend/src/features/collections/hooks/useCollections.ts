import { useState, useEffect } from 'react';
import { Collection, CollectionSet } from '@/src/entities/collection';
import { getRecentCollections, getUserCollections, getFolloweeCollections, getUserCollectionSets } from '../api';
import { ApiError } from '@/src/shared/api/error';
import { getAllOfflineCollections } from '@/src/shared/api/offlineApi';
import { mergePendingCollections } from '@/src/shared/api/mergePendingActions';

export function useRecentCollections(enabled: boolean = true) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    const refresh = async () => {
        setLoading(true);
        setIsOffline(false);
        try {
            const data = await getRecentCollections();
            const merged = await mergePendingCollections(data);
            setCollections(merged);
            setError(null);
        } catch (err) {
            if (err instanceof ApiError && (err.status === 503 || err.status === 0)) {
                setIsOffline(true);
                // 近況の代わりにオフライン保存済みを表示
                const offline = await getAllOfflineCollections();
                const merged = await mergePendingCollections(offline);
                setCollections(merged);
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch collections');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (enabled) {
            refresh();
        }
    }, [enabled]);

    return { collections, loading, error, isOffline, refresh };
}

export function useUserCollections(userId: string | undefined) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    const refresh = async () => {
        if (!userId) return;
        setLoading(true);
        setIsOffline(false);
        try {
            const data = await getUserCollections(userId);
            const merged = await mergePendingCollections(data);
            setCollections(merged);
            setError(null);
        } catch (err) {
            if (err instanceof ApiError && (err.status === 503 || err.status === 0)) {
                setIsOffline(true);
                // オフライン保存済みから自分のものを抽出 (自動キャッシュも含める)
                const allOffline = await getAllOfflineCollections(false);
                const filtered = allOffline.filter(c => c.userId === userId);
                const merged = await mergePendingCollections(filtered);
                setCollections(merged);
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch user collections');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [userId]);

    return { collections, loading, error, isOffline, refresh };
}

export function useFolloweeCollections(enabled: boolean = true) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    const refresh = async () => {
        setLoading(true);
        setIsOffline(false);
        try {
            const data = await getFolloweeCollections();
            const merged = await mergePendingCollections(data);
            setCollections(merged);
            setError(null);
        } catch (err) {
            if (err instanceof ApiError && (err.status === 503 || err.status === 0)) {
                setIsOffline(true);
                // タイムライン用にオフラインデータを取得
                const offline = await getAllOfflineCollections();
                const merged = await mergePendingCollections(offline);
                setCollections(merged);
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch followee collections');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (enabled) {
            refresh();
        }
    }, [enabled]);

    return { collections, loading, error, isOffline, refresh };
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
            setCollectionSets(data);
            setError(null);
        } catch (err) {
            if (err instanceof ApiError && (err.status === 503 || err.status === 0)) {
                setIsOffline(true);
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
