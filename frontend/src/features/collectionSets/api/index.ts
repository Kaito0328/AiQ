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

export const createSet = async (req: CreateCollectionSetRequest): Promise<CollectionSet> => {
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
    return await apiClient<CollectionSet>(`/collection-sets/${setId}`, {
        method: 'PUT',
        body: JSON.stringify(req),
        authenticated: true,
    });
};

export const deleteSet = async (setId: string): Promise<void> => {
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
