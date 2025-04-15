import { useState } from 'react';
import { Question, QuestionInput } from '../../types/question';
import { ErrorCode } from '../../types/error';

export const useQuestionState = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pendingCreations, setPendingCreations] = useState<QuestionInput[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<{ id: number; updated: QuestionInput }[]>(
    [],
  );
  const [createErrors, setCreateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [answerVisibilityMap, setAnswerVisibilityMap] = useState<{ [id: number]: boolean }>({});

  return {
    questions,
    setQuestions,
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
    answerVisibilityMap,
    setAnswerVisibilityMap,
  };
};
