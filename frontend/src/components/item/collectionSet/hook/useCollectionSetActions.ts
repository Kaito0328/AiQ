import {
  deleteCollectionSet,
  deleteCollectionSets,
  upsertCollectionSets,
} from '../../../../api/CollectionSetAPI';
import { BatchDeleteResponse, BatchUpsertResponse } from '../../../../types/batchResponse';
import { ErrorCode } from '../../../../types/error';
import { useCollectionSetState } from './useCollectionSetState';
import { CollectionSet } from '../../../../types/collectionSet';
import { handleError } from '../../../../api/handleAPIError';

export const useCollectionSetActions = (state: ReturnType<typeof useCollectionSetState>) => {
  const {
    setCollectionSets,
    setErrorMessage,
    pendingCreations,
    setPendingCreations,
    pendingUpdates,
    setPendingUpdates,
    setCreateErrors,
    setUpdateErrors,
  } = state;

  const handleCollectionSetBatchUpsert = async () => {
    setCreateErrors({});
    setUpdateErrors({});

    const request = {
      createsRequest: pendingCreations.map((input, index) => ({ index, input })),
      updatesRequest: pendingUpdates.map(({ id, updated }) => ({ id, input: updated })),
    };

    try {
      const res: BatchUpsertResponse<CollectionSet> = await upsertCollectionSets(request);

      setCollectionSets((prev) => {
        const updatedIds = res.successItems.map((item) => item.id);
        const withoutUpdated = prev.filter((item) => !updatedIds.includes(item.id));
        return [...withoutUpdated, ...res.successItems];
      });

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
      setErrorMessage(handleError(e));
      console.error('保存中にエラーが発生しました', e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('本当に削除しますか？')) return;

    try {
      await deleteCollectionSet(id);
      setCollectionSets((prev) => prev.filter((col) => col.id !== id));
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error('削除失敗:', e);
    }
  };
  const handleBatchDelete = async (ids: number[]): Promise<BatchDeleteResponse<CollectionSet>> => {
    const ok = window.confirm(`${ids.length}件を削除しますか？`);
    if (!ok) return { successItems: [], failedItems: [] };

    try {
      const res: BatchDeleteResponse<CollectionSet> = await deleteCollectionSets(ids); // <- バックエンドがこういうAPIを提供している想定

      const successIds = res.successItems.map((item) => item.id);
      setCollectionSets((prev) => prev.filter((col) => !successIds.includes(col.id)));

      return res;
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error('一括削除失敗:', e);
      return { successItems: [], failedItems: [] };
    }
  };

  return {
    handleCollectionSetBatchUpsert,
    handleDelete,
    handleBatchDelete,
  };
};
