import { deleteCollection, deleteCollections, upsertCollections } from '../../../../api/CollectionAPI';
import { Collection } from '../../../../types/collection';
import { BatchDeleteResponse, BatchUpsertResponse } from '../../../../types/batchResponse';
import { ErrorCode } from '../../../../types/error';
import { useCollectionState } from './useCollectionState';
import { handleError } from '../../../../api/handleAPIError';

export const useCollectionActions = (
  collectionSetId: number,
  state: ReturnType<typeof useCollectionState>,
) => {
  const {
    setCollections,
    setErrorMessage,
    pendingCreations,
    setPendingCreations,
    pendingUpdates,
    setPendingUpdates,
    setCreateErrors,
    setUpdateErrors,
  } = state;

  const handleCollectionBatchUpsert = async () => {
    setCreateErrors({});
    setUpdateErrors({});

    const request = {
      createsRequest: pendingCreations.map((input, index) => ({ index, input })),
      updatesRequest: pendingUpdates.map(({ id, updated }) => ({ id, input: updated })),
    };

    try {
        const res: BatchUpsertResponse<Collection> = await upsertCollections(
          collectionSetId,
          request,
        );
  
        setCollections((prev) => {
            const updatedIds = res.successItems.map(item => item.id);
            const withoutUpdated = prev.filter(item => !updatedIds.includes(item.id));
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
      } catch (e) {
        setErrorMessage(handleError(e));
        console.error('保存中にエラーが発生しました', e);
      }

  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      await deleteCollection(id);
      setCollections(prev => prev.filter(col => col.id !== id));
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error("削除失敗:", e);
    }
  };
  const handleBatchDelete = async (ids: number[]): Promise<BatchDeleteResponse<Collection>> => {
    const ok = window.confirm(`${ids.length}件を削除しますか？`);
    if (!ok) return { successItems: [], failedItems: [] };

    try {
      const res: BatchDeleteResponse<Collection> = await deleteCollections(ids); // <- バックエンドがこういうAPIを提供している想定

      const successIds = res.successItems.map(item => item.id);
      setCollections(prev => prev.filter(col => !successIds.includes(col.id)));

      return res;
    } catch (e) {
      setErrorMessage(handleError(e));
      console.error("一括削除失敗:", e);
      return { successItems: [], failedItems: [] };
    }
  };

  return {
    handleCollectionBatchUpsert,
    handleDelete,
    handleBatchDelete,
  };
};
