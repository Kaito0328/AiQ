import { apiClient } from '@/src/shared/api/apiClient';
import { Collection, CollectionSet, CollectionSetResponse } from '@/src/entities/collection';
import {
    CreateCollectionRequest,
    UpdateCollectionRequest,
    BatchCollectionsRequest
} from '../types';

export const getCollection = async (id: string): Promise<Collection> => {
    return await apiClient<Collection>(`/collections/${id}`, { authenticated: true });
};

export const createCollection = async (data: CreateCollectionRequest): Promise<Collection> => {
    return await apiClient<Collection>('/collections', {
        method: 'POST',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

export const updateCollection = async (id: string, data: UpdateCollectionRequest): Promise<Collection> => {
    return await apiClient<Collection>(`/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

export const deleteCollection = async (id: string): Promise<void> => {
    await apiClient<void>(`/collections/${id}`, {
        method: 'DELETE',
        authenticated: true,
    });
};

export const getUserCollections = async (userId: string): Promise<Collection[]> => {
    return await apiClient<Collection[]>(`/users/${userId}/collections`, { authenticated: true });
};

export const getFolloweeCollections = async (limit = 20, offset = 0): Promise<Collection[]> => {
    return await apiClient<Collection[]>(`/timeline/followees?limit=${limit}&offset=${offset}`, { authenticated: true });
};

export const getRecentCollections = async (limit = 20, offset = 0): Promise<Collection[]> => {
    return await apiClient<Collection[]>(`/timeline/recent?limit=${limit}&offset=${offset}`, { authenticated: true });
};

export const batchCollections = async (data: BatchCollectionsRequest): Promise<void> => {
    await apiClient<void>('/collections/batch', {
        method: 'POST',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

export const getUserCollectionSets = async (userId: string): Promise<CollectionSet[]> => {
    return await apiClient<CollectionSet[]>(`/users/${userId}/collection-sets`, { authenticated: true });
};

export const getCollectionSet = async (setId: string): Promise<CollectionSetResponse> => {
    return await apiClient<CollectionSetResponse>(`/collection-sets/${setId}`, { authenticated: true });
};
