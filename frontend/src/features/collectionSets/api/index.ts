import { apiClient } from '@/src/shared/api/apiClient';
import { CollectionSet, CollectionSetResponse } from '@/src/entities/collection';

export interface CreateCollectionSetRequest {
    name: string;
    descriptionText?: string;
    isOpen: boolean;
}

export interface UpdateCollectionSetRequest {
    name: string;
    descriptionText?: string;
    isOpen: boolean;
}

export interface AddCollectionToSetRequest {
    collectionId: string;
    displayOrder: number;
}

function isOfflineMode(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aiq_manual_offline') === 'true' || !navigator.onLine;
}

function createTemporarySet(req: CreateCollectionSetRequest): CollectionSet {
    const profileRaw = typeof window !== 'undefined' ? localStorage.getItem('aiq_user_profile') : null;
    let userId = 'local-user';

    if (profileRaw) {
        try {
            const parsed = JSON.parse(profileRaw) as { id?: string };
            if (parsed?.id) userId = parsed.id;
        } catch {
            // ignore malformed profile cache
        }
    }

    const tempId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? `local-set-${crypto.randomUUID()}`
            : `local-set-${Date.now()}`;
    const now = new Date().toISOString();

    return {
        id: tempId,
        userId,
        name: req.name,
        descriptionText: req.descriptionText,
        isOpen: req.isOpen,
        createdAt: now,
        updatedAt: now,
    };
}

export const createSet = async (req: CreateCollectionSetRequest): Promise<CollectionSet> => {
    if (isOfflineMode()) {
        const { syncManager } = await import('@/src/shared/api/SyncManager');
        const tempSet = createTemporarySet(req);
        await syncManager.addAction('CREATE_SET', { tempSet, data: req });
        return tempSet;
    }

    return await apiClient<CollectionSet>('/collection-sets', {
        method: 'POST',
        body: JSON.stringify(req),
        authenticated: true,
    });
};

export const getSet = async (setId: string): Promise<CollectionSetResponse> => {
    return await apiClient<CollectionSetResponse>(`/collection-sets/${setId}`, {
        authenticated: true,
    });
};

export const getUserSets = async (userId: string): Promise<CollectionSet[]> => {
    return await apiClient<CollectionSet[]>(`/users/${userId}/collection-sets`, {
        authenticated: true,
    });
};

export const updateSet = async (setId: string, req: UpdateCollectionSetRequest): Promise<CollectionSet> => {
    if (isOfflineMode()) {
        const { syncManager } = await import('@/src/shared/api/SyncManager');
        await syncManager.addAction('UPDATE_SET', { id: setId, data: req });

        const now = new Date().toISOString();
        const profileRaw = typeof window !== 'undefined' ? localStorage.getItem('aiq_user_profile') : null;
        let userId = 'local-user';
        if (profileRaw) {
            try {
                const parsed = JSON.parse(profileRaw) as { id?: string };
                if (parsed?.id) userId = parsed.id;
            } catch {
                // ignore malformed profile cache
            }
        }

        return {
            id: setId,
            userId,
            name: req.name,
            descriptionText: req.descriptionText,
            isOpen: req.isOpen,
            createdAt: now,
            updatedAt: now,
        };
    }

    return await apiClient<CollectionSet>(`/collection-sets/${setId}`, {
        method: 'PUT',
        body: JSON.stringify(req),
        authenticated: true,
    });
};

export const deleteSet = async (setId: string): Promise<void> => {
    if (isOfflineMode()) {
        const { syncManager } = await import('@/src/shared/api/SyncManager');
        await syncManager.addAction('DELETE_SET', { setId });
        return;
    }

    await apiClient<void>(`/collection-sets/${setId}`, {
        method: 'DELETE',
        authenticated: true,
    });
};

export const addCollectionToSet = async (setId: string, req: AddCollectionToSetRequest): Promise<void> => {
    await apiClient<void>(`/collection-sets/${setId}/collections`, {
        method: 'POST',
        body: JSON.stringify(req),
        authenticated: true,
    });
};

export const removeCollectionFromSet = async (setId: string, collectionId: string): Promise<void> => {
    await apiClient<void>(`/collection-sets/${setId}/collections/${collectionId}`, {
        method: 'DELETE',
        authenticated: true,
    });
};
