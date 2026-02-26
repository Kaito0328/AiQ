import { useState, useEffect } from 'react';
import { CollectionSet, CollectionSetResponse } from '@/src/entities/collection';
import { getSet, addCollectionToSet, removeCollectionFromSet } from '../api';

export function useCollectionSet(setId: string | undefined) {
    const [data, setData] = useState<CollectionSetResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        if (!setId) return;
        setLoading(true);
        try {
            const resp = await getSet(setId);
            setData(resp);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch collection set');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [setId]);

    const addCollection = async (collectionId: string, displayOrder: number) => {
        if (!setId) return;
        await addCollectionToSet(setId, { collectionId, displayOrder });
        await refresh();
    };

    const removeCollection = async (collectionId: string) => {
        if (!setId) return;
        await removeCollectionFromSet(setId, collectionId);
        await refresh();
    };

    return { set: data?.set, collections: data?.collections || [], loading, error, refresh, addCollection, removeCollection };
}
