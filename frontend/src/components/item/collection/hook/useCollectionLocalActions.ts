import { Collection, CollectionInput } from '../../../../types/collection';
import { useCallback } from 'react';
import { useCollectionState } from './useCollectionState';

export const useCollectionLocalActions = (state: ReturnType<typeof useCollectionState>) => {
  const { setCollections, setPendingCreations, setPendingUpdates, setSelectedIds } = state;

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

      setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    },
    [setCollections, setPendingUpdates],
  );

  const handleLocalCreate = useCallback(
    (index: number, updated: CollectionInput) => {
      setPendingCreations((prev) => prev.map((c, i) => (i === index ? { ...c, ...updated } : c)));
    },
    [setPendingCreations],
  );

  const initLocalCollection = useCallback(
    (initCollection: Collection[]) => {
      setCollections(initCollection);
    },
    [setCollections],
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
    initLocalCollection,
    handleAddPendingCreation,
    toggleSelect,
  };
};
