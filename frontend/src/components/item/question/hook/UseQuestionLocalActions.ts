import { useCallback } from 'react';
import { QuestionInput } from '../../../../types/question';
import { useQuestionState } from './useQuestionState';

export const useQuestionLocalActions = (state: ReturnType<typeof useQuestionState>) => {
  const { setQuestions, setPendingCreations, setPendingUpdates, setSelectedIds } = state;

  const handleLocalUpdate = useCallback(
    (id: number, updated: QuestionInput) => {
      setPendingUpdates((prev) => {
        const index = prev.findIndex((p) => p.id === id);
        if (index !== -1) {
          const newList = [...prev];
          newList[index] = { id, updated };
          return newList;
        } else {
          return [...prev, { id, updated }];
        }
      });

      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
    },
    [setQuestions, setPendingUpdates],
  );

  const handleLocalCreate = useCallback(
    (index: number, updated: QuestionInput) => {
      setPendingCreations((prev) => prev.map((q, i) => (i === index ? { ...q, ...updated } : q)));
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

  return {
    handleLocalCreate,
    handleLocalUpdate,
    handleAddPendingCreation,
    toggleSelect,
  };
};
