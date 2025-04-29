import { fetchFromAPI } from './api';
import { Collection, CollectionInput } from '../types/collection';
import { BatchUpsertRequest } from '../types/batchRequest';
import { BatchDeleteResponse, BatchUpsertResponse } from '../types/batchResponse';

export const getCollection = async (id: number): Promise<Collection> => {
  const response = await fetchFromAPI(`/collection/${id}`, { method: 'GET' }, true);
  return response.json();
};

export const getCollectionsByCollectionSetId = async (
  collectionSetId: number,
): Promise<Collection[]> => {
  const response = await fetchFromAPI(
    `/collections/collection-set/${collectionSetId}`,
    { method: 'GET' },
    true,
  );
  return response.json();
};

export const getCollectionsByUserId = async (userId: number): Promise<Collection[]> => {
  const response = await fetchFromAPI(`/collections/user/${userId}`, { method: 'GET' }, true);
  return response.json();
};

// ユーザーのお気に入り一覧取得
export const getFavoriteCollections = async (userId: number): Promise<Collection[]> => {
  const response = await fetchFromAPI(`/collections/user/${userId}/favorites`, {}, true);
  return response.json();
};

export const createCollection = async (
  collectionSetId: number,
  request: CollectionInput,
): Promise<Collection> => {
  const response = await fetchFromAPI(
    `/collection/collection-set/${collectionSetId}`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true,
  );

  return response.json();
};

export const updateCollection = async (
  collectionId: number,
  request: CollectionInput,
): Promise<Collection> => {
  const response = await fetchFromAPI(
    `/collection/${collectionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(request),
    },
    true,
  );
  return response.json();
};

export const upsertCollections = async (
  collectionSetId: number,
  request: BatchUpsertRequest<CollectionInput>,
): Promise<BatchUpsertResponse<Collection>> => {
  const response = await fetchFromAPI(
    `/collections/collection-set/${collectionSetId}`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true,
  );
  return response.json();
};

export const deleteCollection = async (collectionId: number): Promise<Collection> => {
  const response = await fetchFromAPI(
    `/collection/${collectionId}`,
    {
      method: 'DELETE',
    },
    true,
  );

  return response.json();
};

export const deleteCollections = async (
  collectionIds: number[],
): Promise<BatchDeleteResponse<Collection>> => {
  const response = await fetchFromAPI(
    `/collections`,
    {
      method: 'DELETE',
      body: JSON.stringify(collectionIds),
    },
    true,
  );

  return response.json();
};
