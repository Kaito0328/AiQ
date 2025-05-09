import { useState } from 'react';
import { ErrorCode } from '../../../../types/error';
import { CollectionSet, CollectionSetInput } from '../../../../types/collectionSet';

export const useCollectionSetState = () => {
  const [collectionSets, setCollectionSets] = useState<CollectionSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [pendingCreations, setPendingCreations] = useState<CollectionSetInput[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<
    { id: number; updated: CollectionSetInput }[]
  >([]);
  const [createErrors, setCreateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  return {
    collectionSets,
    setCollectionSets,
    loading,
    setLoading,
    errorMessage,
    setErrorMessage,
    pendingCreations,
    setPendingCreations,
    pendingUpdates,
    setPendingUpdates,
    createErrors,
    setCreateErrors,
    updateErrors,
    setUpdateErrors,
    selectedIds,
    setSelectedIds,
  };
};
