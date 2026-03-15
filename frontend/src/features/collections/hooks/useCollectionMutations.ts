import { useCallback } from 'react';
import { useNetworkStatus } from '@/src/shared/contexts/NetworkStatusContext';
import { db } from '@/src/shared/db/db';
import { syncManager } from '@/src/shared/api/SyncManager';
import { createCollection, updateCollection, deleteCollection } from '../api';
import { CreateCollectionRequest, UpdateCollectionRequest } from '../types';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Collection } from '@/src/entities/collection';

export function useCollectionMutations() {
    const { isOnline } = useNetworkStatus();
    const { user } = useAuth();

    const doCreateCollection = useCallback(async (data: CreateCollectionRequest): Promise<Collection> => {
        if (isOnline) {
            const created = await createCollection(data);
            await db.collections.put({
                ...created,
                savedAt: Date.now(),
                isExplicitlySaved: true
            });
            return created;
        } else {
            const tempId = `temp-${Date.now()}`;
            const tempCollection: any = {
                id: tempId,
                ...data,
                userId: user?.id || 'offline-user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                savedAt: Date.now(),
                isExplicitlySaved: true
            };
            await db.collections.put(tempCollection);
            await syncManager.addAction('CREATE_COLLECTION', data);
            return tempCollection as Collection;
        }
    }, [isOnline, user?.id]);

    const doUpdateCollection = useCallback(async (id: string, data: UpdateCollectionRequest): Promise<Collection> => {
        if (isOnline) {
            const updated = await updateCollection(id, data);
            await db.collections.put({
                ...updated,
                savedAt: Date.now(),
                isExplicitlySaved: true
            });
            return updated;
        } else {
            const current = await db.collections.get(id);
            if (current) {
                const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
                await db.collections.put(updated as any);
            }
            await syncManager.addAction('UPDATE_COLLECTION', { id, data });
            return (current || { id, ...data }) as Collection;
        }
    }, [isOnline]);

    const doDeleteCollection = useCallback(async (id: string): Promise<void> => {
        if (isOnline) {
            await deleteCollection(id);
            await db.collections.delete(id);
        } else {
            await db.collections.delete(id);
            await syncManager.addAction('DELETE_COLLECTION', id);
        }
    }, [isOnline]);

    return {
        createCollection: doCreateCollection,
        updateCollection: doUpdateCollection,
        deleteCollection: doDeleteCollection
    };
}
