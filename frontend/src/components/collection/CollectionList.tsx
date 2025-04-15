import React, { useEffect, useState } from "react";
import CollectionItem from "./CollectionItem";
import { Collection, CollectionInput } from "../../types/collection";
import { getCollectionsByCollectionSetId } from "../../api/CollectionAPI"; // ← ここでAPI関数をインポート
import { useCollectionActions } from "./useCollectionActions";
import { useCollectionLocalActions } from "./useCollectionLocalActions";
import { useCollectionState } from "./useCollectionState";
import { FaPlus, FaSave, FaTrashAlt, FaCheckSquare, FaTimesCircle } from "react-icons/fa";

interface Props {
  collectionSetId: number;
  userId: number;
  isOwner: boolean;
}

const CollectionList: React.FC<Props> = ({ collectionSetId, userId, isOwner }) => {
  const state = useCollectionState();
  const { handleCollectionBatchUpsert, handleDelete, handleBatchDelete } = useCollectionActions(collectionSetId, state);
  const { handleLocalCreate, handleLocalUpdate, initLocalCollection, handleAddPendingCreation, toggleSelect } = useCollectionLocalActions(state);

  const [isSelecting, setIsSelecting] = useState(false);

  
  // 初期コレクションの読み込み
  useEffect(() => {
    (async () => {
      const res = await getCollectionsByCollectionSetId(collectionSetId);
      initLocalCollection(res);
    })();
  }, [collectionSetId , initLocalCollection]);

  const toggleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    state.setSelectedIds([]); // モード切替時に選択解除
  };

  return (
    <div>
      <ul className="space-y-4">
        {state.collections.map((collection: Collection) => (
          <div
            key={`existing-${collection.id}`}
            className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg shadow-sm"
          >
            {isSelecting && (
              <input
                type="checkbox"
                className="mt-3 accent-blue-500 scale-125"
                checked={state.selectedIds.includes(collection.id)}
                onChange={() => toggleSelect(collection.id)}
              />
            )}
            <CollectionItem
              collection={collection}
              userId={userId}
              isOwner={isOwner}
              isNew={false}
              errorMessages={state.updateErrors[collection.id]}
              onChange={(updated) => handleLocalUpdate(collection.id, updated)}
              onDelete={() => handleDelete(collection.id)}
            />
          </div>
        ))}
  
        {state.pendingCreations.map((collection: CollectionInput, index: number) => (
          <div key={`new-${index}`} className="p-2 bg-yellow-50 rounded-lg shadow-sm">
            <CollectionItem
              collection={collection}
              userId={userId}
              isOwner={isOwner}
              isNew={true}
              errorMessages={state.createErrors[index]}
              onChange={(updated) => handleLocalCreate(index, updated)}
              onDelete={() => {
                state.setPendingCreations((prev) =>
                  prev.filter((_, i) => i !== index)
                );
              }}
            />
          </div>
        ))}
      </ul>
      {isOwner && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            onClick={handleAddPendingCreation}
          >
            <FaPlus />
            <span>新規追加</span>
          </button>
    
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-white ${
              state.pendingCreations.length === 0 && state.pendingUpdates.length === 0
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            onClick={handleCollectionBatchUpsert}
            disabled={
              state.pendingCreations.length === 0 && state.pendingUpdates.length === 0
            }
          >
            <FaSave />
            <span>一括保存</span>
          </button>
    
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition ${
              isSelecting ? "bg-gray-500 hover:bg-gray-600" : "bg-yellow-500 hover:bg-yellow-600"
            }`}
            onClick={toggleSelectMode}
          >
            {isSelecting ? <FaTimesCircle /> : <FaCheckSquare />}
            <span>{isSelecting ? "選択解除" : "選択"}</span>
          </button>
    
          {isSelecting && (
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition ${
                state.selectedIds.length === 0
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={() => handleBatchDelete(state.selectedIds)}
              disabled={state.selectedIds.length === 0}
            >
              <FaTrashAlt />
              <span>選択削除</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
  
};

export default CollectionList;
