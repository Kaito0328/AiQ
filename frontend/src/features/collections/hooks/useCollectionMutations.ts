import { useCallback } from 'react';
import { useNetworkStatus } from '@/src/shared/contexts/NetworkStatusContext';
import { db } from '@/src/shared/db/db';
import { syncManager } from '@/src/shared/api/SyncManager';
import { createCollection, updateCollection, deleteCollection, upsertCollectionSearchMetadata } from '../api';
import { CreateCollectionRequest, UpdateCollectionRequest } from '../types';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Collection } from '@/src/entities/collection';

export function useCollectionMutations() {
    const { isOnline } = useNetworkStatus();
    const { user } = useAuth();

    const doCreateCollection = useCallback(async (data: CreateCollectionRequest): Promise<Collection> => {
        const { tags, difficultyLevel, ...baseData } = data;
        const hasSearchMetadataPayload =
            (Object.prototype.hasOwnProperty.call(data, 'difficultyLevel') && difficultyLevel !== undefined) ||
            (Object.prototype.hasOwnProperty.call(data, 'tags') && tags !== undefined);
        if (isOnline) {
            const created = await createCollection(baseData);
            if (hasSearchMetadataPayload) {
                await upsertCollectionSearchMetadata(created.id, {
                    difficultyLevel,
                    tags,
                });
            }
            await db.collections.put({
                ...created,
                difficultyLevel,
                tags,
                savedAt: Date.now(),
                isExplicitlySaved: true
            });
            return {
                ...created,
                difficultyLevel,
                tags,
            };
        } else {
            const tempId = `temp-${Date.now()}`;
            const tempCollection: any = {
                id: tempId,
                ...baseData,
                tags,
                difficultyLevel,
                userId: user?.id || 'offline-user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                savedAt: Date.now(),
                isExplicitlySaved: true
            };
            await db.collections.put(tempCollection);
            await syncManager.addAction('CREATE_COLLECTION', baseData);
            return tempCollection as Collection;
        }
    }, [isOnline, user?.id]);

    const doUpdateCollection = useCallback(async (id: string, data: UpdateCollectionRequest): Promise<Collection> => {
        const { tags, difficultyLevel, ...baseData } = data;
        const hasSearchMetadataPayload =
            (Object.prototype.hasOwnProperty.call(data, 'difficultyLevel') && difficultyLevel !== undefined) ||
            (Object.prototype.hasOwnProperty.call(data, 'tags') && tags !== undefined);
        if (isOnline) {
            const current = await db.collections.get(id);
            const updated = await updateCollection(id, baseData);
            if (hasSearchMetadataPayload) {
                await upsertCollectionSearchMetadata(id, {
                    difficultyLevel,
                    tags,
                });
            }
            const nextDifficulty = difficultyLevel ?? current?.difficultyLevel;
            const nextTags = tags ?? current?.tags;
            await db.collections.put({
                ...updated,
                difficultyLevel: nextDifficulty,
                tags: nextTags,
                savedAt: Date.now(),
                isExplicitlySaved: true
            });
            return {
                ...updated,
                difficultyLevel: nextDifficulty,
                tags: nextTags,
            };
        } else {
            const current = await db.collections.get(id);
            if (current) {
                const updated = {
                    ...current,
                    ...baseData,
                    ...(tags !== undefined ? { tags } : {}),
                    ...(difficultyLevel !== undefined ? { difficultyLevel } : {}),
                    updatedAt: new Date().toISOString(),
                };
                await db.collections.put(updated as any);
                await syncManager.addAction('UPDATE_COLLECTION', { id, data: baseData });
                return updated as Collection;
            }
            await syncManager.addAction('UPDATE_COLLECTION', { id, data: baseData });
            return ({
                id,
                ...baseData,
                ...(tags !== undefined ? { tags } : {}),
                ...(difficultyLevel !== undefined ? { difficultyLevel } : {}),
            }) as Collection;
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
