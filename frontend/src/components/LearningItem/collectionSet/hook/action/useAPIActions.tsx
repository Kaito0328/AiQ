import { BatchDeleteResponse, BatchUpsertResponse, FailedCreateItem, FailedItem } from '../../../../../types/batchResponse';
import { ErrorCode } from '../../../../../types/error';
import { handleError } from '../../../../../api/handleAPIError';
import { useAPIState } from '../state/useAPIState';
import { useCallback } from 'react';
import { deleteCollectionSet, deleteCollectionSets, getCollectionSetsByUserId, upsertCollectionSets } from '../../../../../api/CollectionSetAPI';
import { CollectionSet, CollectionSetInput } from '../../../../../types/collectionSet';

export const useAPIActions = (
  apiState: ReturnType<typeof useAPIState>,
) => {
  const {
    setCollectionSets,
    setLoading,
    setErrorMessage,
    setCreateErrors,
    setUpdateErrors,
  } = apiState;

  const initCollections = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      const res = await getCollectionSetsByUserId(userId);
      setCollectionSets(res);
    } catch (e) {
      setErrorMessage(handleError(e));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setCollectionSets, setErrorMessage]);

  const handleCollectionBatchUpsert = useCallback(async (
    pendingCreations: CollectionSetInput[],
    pendingUpdates: { id: number; updated: CollectionSetInput }[]
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
      const res: BatchUpsertResponse<CollectionSet> = await upsertCollectionSets(
        request
      );

      // 成功分を state に反映
      setCollectionSets((prev) => {
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
  }, [setCollectionSets, setCreateErrors, setUpdateErrors, setErrorMessage]);

  const handleDelete = useCallback(async (collectionSetId: number) => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await deleteCollectionSet(collectionSetId);
      setCollectionSets(prev => prev.filter(col => col.id !== collectionSetId));
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error("削除失敗:", e);
    }
  }, [setCollectionSets, setErrorMessage]);

  const handleBatchDelete = useCallback(async (collectionSetIds: number[]): Promise<BatchDeleteResponse<CollectionSet>> => {
    const ok = window.confirm(`${collectionSetIds.length}件を削除しますか？`);
    if (!ok) return { successItems: [], failedItems: [] };

    try {
      const res: BatchDeleteResponse<CollectionSet> = await deleteCollectionSets(collectionSetIds);
      const successIds = res.successItems.map(item => item.id);
      setCollectionSets(prev => prev.filter(col => !successIds.includes(col.id)));
      return res;
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error("一括削除失敗:", e);
      return { successItems: [], failedItems: [] };
    }
  }, [setCollectionSets, setErrorMessage]);

  return {
    initCollections,
    handleCollectionBatchUpsert,
    handleDelete,
    handleBatchDelete,
  };
};
