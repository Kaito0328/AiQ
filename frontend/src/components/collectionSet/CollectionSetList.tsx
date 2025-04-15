import React, { useEffect, useState } from "react";
import { CollectionSet } from "../../types/collectionSet";
import { getCollectionSetsByUserId } from "../../api/CollectionSetAPI";
import { useCollectionSetActions } from "./useCollectionSetActions";
import { useCollectionSetLocalActions } from "./useCollectionSetLocalActions";
import { useCollectionSetState } from "./useCollectionSetState";
import { FaCheckSquare, FaPlus, FaSave, FaTrashAlt } from "react-icons/fa";
import CollectionSetItem from "./CollectionSetItem";

interface Props {
  userId: number;
  isOwner: boolean;
}

const CollectionSetList: React.FC<Props> = ({ userId, isOwner }) => {
  const state = useCollectionSetState();
  const { handleCollectionSetBatchUpsert, handleDelete, handleBatchDelete } = useCollectionSetActions(state);
  const {
    handleLocalCreate,
    handleLocalUpdate,
    initLocalCollectionSet,
    handleAddPendingCreation,
    toggleSelect,
  } = useCollectionSetLocalActions(state);

  const [isSelecting, setIsSelecting] = useState(false);

  // 初期コレクションセットの読み込み
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const res = await getCollectionSetsByUserId(userId);
      initLocalCollectionSet(res);
    })();
  }, [userId, initLocalCollectionSet]);

  // モード切替時に選択解除
  const toggleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    state.setSelectedIds([]); // モード切替時に選択解除
  };

  const handleCreateDelete = (index: number) => {
    state.setPendingCreations((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <ul className="space-y-4">
        {state.collectionSets.map((collectionSet: CollectionSet) => (
          <div
            key={`existing-${collectionSet.id}`}
            className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg shadow-sm"
          >
            {isSelecting && (
              <input
                type="checkbox"
                className="mt-3 accent-blue-500 scale-125"
                checked={state.selectedIds.includes(collectionSet.id)}
                onChange={() => toggleSelect(collectionSet.id)}
              />
            )}
            <CollectionSetItem
              collectionSet={collectionSet}
              userId={userId}
              isOwner={isOwner}
              isNew={false}
              errorMessages={state.updateErrors[collectionSet.id]}
              onChange={(updated) => handleLocalUpdate(collectionSet.id, updated)}
              onDelete={() => handleDelete(collectionSet.id)}
            />
          </div>
        ))}

        {state.pendingCreations.map((collectionSet, index) => (
          <div key={`new-${index}`} className="p-2 bg-yellow-50 rounded-lg shadow-sm">
            <CollectionSetItem
              collectionSet={collectionSet}
              userId={userId}
              isOwner={isOwner}
              isNew={true}
              errorMessages={state.createErrors[index]}
              onChange={(created) => handleLocalCreate(index, created)}
              onDelete={() => handleCreateDelete(index)} 
            />
          </div>
        ))}
      </ul>

      {isOwner && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleAddPendingCreation}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            <FaPlus />
            <span>新規追加</span>
          </button>

          <button
            onClick={handleCollectionSetBatchUpsert}
            disabled={
              state.pendingCreations.length === 0 && state.pendingUpdates.length === 0
            }
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-white ${
              state.pendingCreations.length === 0 && state.pendingUpdates.length === 0
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            <FaSave />
            <span>一括保存</span>
          </button>

          <button
            onClick={toggleSelectMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition ${
              isSelecting ? "bg-gray-500 hover:bg-gray-600" : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {isSelecting ? <FaTrashAlt /> : <FaCheckSquare />}
            <span>{isSelecting ? "選択解除" : "選択"}</span>
          </button>

          {isSelecting && (
            <button
              onClick={() => handleBatchDelete(state.selectedIds)}
              disabled={state.selectedIds.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition ${
                state.selectedIds.length === 0
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
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

export default CollectionSetList;
