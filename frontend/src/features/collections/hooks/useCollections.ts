import { useState, useEffect } from 'react';
import { Collection, CollectionSet } from '@/src/entities/collection';
import { getRecentCollections, getUserCollections, getFolloweeCollections, getUserCollectionSets } from '../api';

export function useRecentCollections(enabled: boolean = true) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await getRecentCollections();
            setCollections(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch collections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (enabled) {
            refresh();
        }
    }, [enabled]);

    return { collections, loading, error, refresh };
}

export function useUserCollections(userId: string | undefined) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await getUserCollections(userId);
            setCollections(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user collections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [userId]);

    return { collections, loading, error, refresh };
}

export function useFolloweeCollections(enabled: boolean = true) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        setLoading(true);
        try {
            const data = await getFolloweeCollections();
            setCollections(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch followee collections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (enabled) {
            refresh();
        }
    }, [enabled]);

    return { collections, loading, error, refresh };
}

export function useUserCollectionSets(userId: string | undefined) {
    const [collectionSets, setCollectionSets] = useState<CollectionSet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await getUserCollectionSets(userId);
            setCollectionSets(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch collection sets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [userId]);

    return { collectionSets, loading, error, refresh };
}
