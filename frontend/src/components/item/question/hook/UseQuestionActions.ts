import {
  deleteQuestion,
  deleteQuestions,
  getQuestionsByCollectionId,
  upsertQuestions,
} from '../../../../api/QuestionAPI';
import { Question } from '../../../../types/question';
import { BatchDeleteResponse, BatchUpsertResponse } from '../../../../types/batchResponse';
import { ErrorCode } from '../../../../types/error';
import { useQuestionState } from './useQuestionState';
import { useCallback } from 'react';

export const useQuestionActions = (
  collectionId: number,
  state: ReturnType<typeof useQuestionState>,
) => {
  const {
    questions,
    setQuestions,
    pendingCreations,
    setPendingCreations,
    pendingUpdates,
    setPendingUpdates,
    setCreateErrors,
    setUpdateErrors,
    setAnswerVisibilityMap,
  } = state;

  const handleQuestionBatchUpsert = async () => {
    setCreateErrors({});
    setUpdateErrors({});

    const request = {
      createsRequest: pendingCreations.map((input, index) => ({ index, input })),
      updatesRequest: pendingUpdates.map(({ id, updated }) => ({ id, input: updated })),
    };

    try {
      const res: BatchUpsertResponse<Question> = await upsertQuestions(collectionId, request);

      const updateQuestions = (questions: Question[], successItems: Question[]) => {
        const updatedIds = successItems.map((item) => item.id);
        const withoutUpdated = questions.filter((item) => !updatedIds.includes(item.id));
        return [...withoutUpdated, ...successItems];
      };
      const updatedQuestions = updateQuestions(questions, res.successItems);
      setQuestions(updatedQuestions);

      mergeAnswerVisibilityMap(updatedQuestions);

      const createErrMap: Record<number, ErrorCode[]> = {};
      res.failedCreateItems.forEach((item) => {
        createErrMap[item.index] = item.errors;
      });
      setCreateErrors(createErrMap);

      const updateErrMap: Record<number, ErrorCode[]> = {};
      res.failedUpdateItems.forEach((item) => {
        updateErrMap[item.id] = item.errors;
      });
      setUpdateErrors(updateErrMap);

      setPendingCreations((prev) =>
        prev.filter((_, index) => res.failedCreateItems.some((item) => item.index === index)),
      );
      setPendingUpdates((prev) =>
        prev.filter((item) => res.failedUpdateItems.some((f) => f.id === item.id)),
      );
      console.log(res);
    } catch (e) {
      console.error('保存中にエラーが発生しました', e);
    }
  };

  const mergeAnswerVisibilityMap = useCallback(
    (questions: Question[]) => {
      setAnswerVisibilityMap((prev) => {
        const updatedMap: { [id: number]: boolean } = { ...prev };
        questions.forEach((q) => {
          if (!(q.id in updatedMap)) {
            updatedMap[q.id] = false; // 未登録のidはfalseで初期化
          }
        });
        return updatedMap;
      });
    },
    [setAnswerVisibilityMap],
  );

  const handleGetQuestion = useCallback(
    async (collectionId: number) => {
      try {
        const res = await getQuestionsByCollectionId(collectionId);
        setQuestions(res);
        mergeAnswerVisibilityMap(res);
      } catch (e) {
        console.error('質問の取得に失敗しました:', e);
      }
    },
    [setQuestions, mergeAnswerVisibilityMap],
  );

  const handleDelete = async (id: number) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setAnswerVisibilityMap((prev) => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });
    } catch (e) {
      console.error('削除失敗:', e);
    }
  };

  const handleBatchDelete = async (
    collectionId: number,
    ids: number[],
  ): Promise<BatchDeleteResponse<Question>> => {
    const ok = window.confirm(`${ids.length}件を削除しますか？`);
    if (!ok) return { successItems: [], failedItems: [] };

    try {
      const res: BatchDeleteResponse<Question> = await deleteQuestions(collectionId, ids);

      const successIds = res.successItems.map((item) => item.id);
      setQuestions((prev) => prev.filter((q) => !successIds.includes(q.id)));
      setAnswerVisibilityMap((prev) => {
        const newMap = { ...prev };
        successIds.forEach((id) => delete newMap[id]);
        return newMap;
      });

      return res;
    } catch (e) {
      console.error('一括削除失敗:', e);
      return { successItems: [], failedItems: [] };
    }
  };

  return {
    handleGetQuestion,
    handleQuestionBatchUpsert,
    handleDelete,
    handleBatchDelete,
  };
};
