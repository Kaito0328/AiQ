import { fetchFromAPI } from './api';
import { CollectionSet, CollectionSetInput } from '../types/collectionSet';
import { BatchUpsertRequest } from '../types/batchRequest';
import { BatchDeleteResponse, BatchUpsertResponse } from '../types/batchResponse';

export const getCollectionSet = async (id: number): Promise<CollectionSet> => {
  const response = await fetchFromAPI(`/collection-set/${id}`, { method: 'GET' }, true);
  return response.json();
};

export const getCollectionSetsByUserId = async (userId: number): Promise<CollectionSet[]> => {
  const response = await fetchFromAPI(`/collection-sets/user/${userId}`, { method: 'GET' }, true);
  return response.json();
};

export const createCollectionSet = async (request: CollectionSetInput): Promise<CollectionSet> => {
  const response = await fetchFromAPI(
    `/collection-set`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true,
  );
  return response.json();
};

export const updateCollectionSet = async (
  collectionSetId: number,
  request: CollectionSetInput,
): Promise<CollectionSet> => {
  const response = await fetchFromAPI(
    `/collection-set/${collectionSetId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(request),
    },
    true,
  );
  return response.json();
};

export const upsertCollectionSets = async (
  request: BatchUpsertRequest<CollectionSetInput>,
): Promise<BatchUpsertResponse<CollectionSet>> => {
  const response = await fetchFromAPI(
    `/collection-sets`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true,
  );
  return response.json();
};

export const deleteCollectionSet = async (collectionSetId: number): Promise<CollectionSet> => {
  const response = await fetchFromAPI(
    `/collection-set/${collectionSetId}`,
    {
      method: 'DELETE',
    },
    true,
  );
  return response.json();
};

export const deleteCollectionSets = async (
  collectionSetIds: number[],
): Promise<BatchDeleteResponse<CollectionSet>> => {
  const response = await fetchFromAPI(
    `/collection-sets`,
    {
      method: 'DELETE',
      body: JSON.stringify(collectionSetIds),
    },
    true,
  );
  return response.json();
};
