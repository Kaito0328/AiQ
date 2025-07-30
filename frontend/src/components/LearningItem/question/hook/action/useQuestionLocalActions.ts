import { useCallback } from 'react';
import { useLocalState } from '../state/useQuestionLocalState';
import { FailedCreateItem, FailedItem } from '../../../../../types/batchResponse';
import { QuestionInput } from '../../../../../types/question';

export const useLocalActions = (localState: ReturnType<typeof useLocalState>) => {
  const { setPendingCreations, setPendingUpdates, setSelectedIds } = localState;

  const handleLocalUpdate = useCallback(
    (id: number, updated: QuestionInput) => {
      console.log('update', updated);
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
    },
    [setPendingUpdates],
  );

  const handleLocalCreate = useCallback(
    (index: number, updated: QuestionInput) => {
      setPendingCreations((prev) => prev.map((c, i) => (i === index ? { ...c, ...updated } : c)));
    },
    [setPendingCreations],
  );
  
  const deleteLocalCreate = useCallback(
    (index: number) => {
      setPendingCreations((prev) => prev.filter((_, i) => i !== index));
    },
    [setPendingCreations],
  );

  const handleAddPendingCreation = () => {
    setPendingCreations((prev) => [
      ...prev,
      { questionText: '', correctAnswer: '', descriptionText: '' },
    ]);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((_id) => _id !== id) : [...prev, id],
    );
  };

  const clearFailedPendingUpdates = (failedItems: FailedItem[]) => {
    setPendingUpdates((prev) => prev.filter((item) => failedItems.some((f) => f.id === item.id)));
  };

  const clearFailedPendingCreates = (failedItems: FailedCreateItem[]) => {
    setPendingCreations((prev) =>
      prev.filter((_, index) => failedItems.some((f) => f.index === index)),
    );
  };

  return {
    handleLocalCreate,
    handleLocalUpdate,
    deleteLocalCreate,
    handleAddPendingCreation,
    toggleSelect,
    clearFailedPendingUpdates,
    clearFailedPendingCreates,
  };
};
