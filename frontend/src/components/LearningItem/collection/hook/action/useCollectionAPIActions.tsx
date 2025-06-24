import { deleteCollection, deleteCollections, getCollectionsByCollectionSetId, upsertCollections } from '../../../../../api/CollectionAPI';
import { Collection, CollectionInput } from '../../../../../types/collection';
import { BatchDeleteResponse, BatchUpsertResponse, FailedCreateItem, FailedItem } from '../../../../../types/batchResponse';
import { ErrorCode } from '../../../../../types/error';
import { handleError } from '../../../../../api/handleAPIError';
import { useCollectionAPIState } from '../state/useCollectionAPIState';
import { useCallback } from 'react';

export const useCollectionAPIActions = (
  collectionSetId: number,
  apiState: ReturnType<typeof useCollectionAPIState>,
) => {
  const {
    setCollections,
    setLoading,
    setErrorMessage,
    setCreateErrors,
    setUpdateErrors,
  } = apiState;

  const initCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCollectionsByCollectionSetId(collectionSetId);
      setCollections(res);
    } catch (e) {
      setErrorMessage(handleError(e));
    } finally {
      setLoading(false);
    }
  }, [setLoading, setCollections, setErrorMessage, collectionSetId]);

  const handleCollectionBatchUpsert = useCallback(async (
    pendingCreations: CollectionInput[],
    pendingUpdates: { id: number; updated: CollectionInput }[]
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
      const res: BatchUpsertResponse<Collection> = await upsertCollections(
        collectionSetId,
        request
      );

      // 成功分を state に反映
      setCollections((prev) => {
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
  }, [collectionSetId, setCollections, setCreateErrors, setUpdateErrors, setErrorMessage]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await deleteCollection(id);
      setCollections(prev => prev.filter(col => col.id !== id));
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error("削除失敗:", e);
    }
  }, [setCollections, setErrorMessage]);

  const handleBatchDelete = useCallback(async (ids: number[]): Promise<BatchDeleteResponse<Collection>> => {
    const ok = window.confirm(`${ids.length}件を削除しますか？`);
    if (!ok) return { successItems: [], failedItems: [] };

    try {
      const res: BatchDeleteResponse<Collection> = await deleteCollections(ids);
      const successIds = res.successItems.map(item => item.id);
      setCollections(prev => prev.filter(col => !successIds.includes(col.id)));
      return res;
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error("一括削除失敗:", e);
      return { successItems: [], failedItems: [] };
    }
  }, [setCollections, setErrorMessage]);

  return {
    initCollections,
    handleCollectionBatchUpsert,
    handleDelete,
    handleBatchDelete,
  };
};
