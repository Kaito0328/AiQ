import { CollectionInput } from '../../types/collection';
import { useCallback } from 'react';
import { useCollectionSetState } from './useCollectionSetState';
import { CollectionSet } from '../../types/collectionSet';

export const useCollectionSetLocalActions = (state: ReturnType<typeof useCollectionSetState>) => {
  const { setCollectionSets, setPendingCreations, setPendingUpdates, setSelectedIds } = state;

  const handleLocalUpdate = useCallback(
    (id: number, updated: CollectionInput) => {
      setPendingUpdates((prev) => {
        const index = prev.findIndex((p) => p.id === id);
        if (index !== -1) {
          // 既に存在 → 更新
          const newList = [...prev];
          newList[index] = { id, updated };
          return newList;
        } else {
          // 存在しない → 追加
          return [...prev, { id, updated }];
        }
      });

      setCollectionSets((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    },
    [setPendingUpdates, setCollectionSets],
  );

  const handleLocalCreate = useCallback(
    (index: number, updated: CollectionInput) => {
      console.log('Created collection-set:', updated);
      setPendingCreations((prev) => prev.map((c, i) => (i === index ? { ...c, ...updated } : c)));
    },
    [setPendingCreations],
  );

  const initLocalCollectionSet = useCallback(
    (initCollection: CollectionSet[]) => {
      setCollectionSets(initCollection);
    },
    [setCollectionSets],
  );

  const handleAddPendingCreation = () => {
    setPendingCreations((prev) => [...prev, { name: '', open: false }]);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((_id) => _id !== id) : [...prev, id],
    );
  };

  return {
    handleLocalCreate,
    handleLocalUpdate,
    initLocalCollectionSet,
    handleAddPendingCreation,
    toggleSelect,
  };
};
