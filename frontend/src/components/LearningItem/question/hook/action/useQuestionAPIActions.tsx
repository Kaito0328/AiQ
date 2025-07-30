import { deleteCollection} from '../../../../../api/CollectionAPI';
import { BatchDeleteResponse, BatchUpsertResponse, FailedCreateItem, FailedItem } from '../../../../../types/batchResponse';
import { ErrorCode } from '../../../../../types/error';
import { handleError } from '../../../../../api/handleAPIError';
import { useAPIState } from '../state/useQuestionAPIState';
import { addFavoriteCollection, removeFavoriteCollection } from '../../../../../api/FavoriteCollection';
import { useCallback } from 'react';
import { deleteQuestions, getQuestionsByCollectionId, upsertQuestions } from '../../../../../api/QuestionAPI';
import { Question, QuestionInput } from '../../../../../types/question';

export const useAPIActions = (
  collectionId: number,
  apiState: ReturnType<typeof useAPIState>,
) => {
  const {
    setQuestions,
    setLoading,
    setErrorMessage,
    setCreateErrors,
    setUpdateErrors,
  } = apiState;

  const initQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getQuestionsByCollectionId(collectionId);
      setQuestions(res);
    } catch (e) {
      setErrorMessage(handleError(e));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setQuestions, setErrorMessage, collectionId]);

  const handleCollectionBatchUpsert = useCallback(async (
    pendingCreations: QuestionInput[],
    pendingUpdates: { id: number; updated: QuestionInput }[]
  ): Promise<{
    failedCreates: FailedCreateItem[];
    failedUpdates: FailedItem[];
  }> => {
    setCreateErrors({});
    setUpdateErrors({});

    const request = {
      createsRequest: pendingCreations.map((input, index) => ({ index, input })),
      updatesRequest: pendingUpdates.map(({ id, updated }) => ({ id, input: updated })),
    };

    try {
      const res: BatchUpsertResponse<Question> = await upsertQuestions(
        collectionId,
        request
      );

      // 成功分を state に反映
      setQuestions((prev) => {
        const updatedIds = res.successItems.map((item) => item.id);
        const withoutUpdated = prev.filter(
          (item) => !updatedIds.includes(item.id)
        );
        return [...withoutUpdated, ...res.successItems];
      });

      // エラーマップ更新
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

      return {
        failedCreates: res.failedCreateItems,
        failedUpdates: res.failedUpdateItems,
      };
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error('保存中にエラーが発生しました', e);
      return {
        failedCreates: [],
        failedUpdates: [],
      };
    }
  }, [collectionId, setQuestions, setCreateErrors, setUpdateErrors, setErrorMessage]);

  const handleDelete = useCallback(async (questionId: number) => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await deleteCollection(questionId);
      setQuestions(prev => prev.filter(que =>     que.id !== questionId));
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error("削除失敗:", e);
    }
  }, [setQuestions, setErrorMessage]);

  const handleBatchDelete = useCallback(async (questionIds: number[], collectionId: number): Promise<BatchDeleteResponse<Question>> => {
    const ok = window.confirm(`${questionIds.length}件を削除しますか？`);
    if (!ok) return { successItems: [], failedItems: [] };

    try {
      const res: BatchDeleteResponse<Question> = await deleteQuestions(questionIds, collectionId);
      const successIds = res.successItems.map(item => item.id);
      setQuestions(prev => prev.filter(que=> !successIds.includes(que.id)));
      return res;
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error("一括削除失敗:", e);
      return { successItems: [], failedItems: [] };
    }
  }, [setQuestions, setErrorMessage]);

  const handleFavorite = useCallback(async (id: number, beforeFavorite: boolean) => {
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorite: !beforeFavorite } : item
      )
    );

    try {
      if (!beforeFavorite) {
        await addFavoriteCollection(id);
      } else {
        await removeFavoriteCollection(id);
      }
    } catch (e) {
      // エラー発生時に元の状態に戻す
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, favorite: beforeFavorite } : item
        )
      );
      setErrorMessage(handleError(e));
    }
  }, [setQuestions, setErrorMessage]);


  return {
    initQuestions,
    handleCollectionBatchUpsert,
    handleDelete,
    handleBatchDelete,
    handleFavorite,
  };
};
