import React, { useEffect, useState } from "react";
import { Collection, CollectionInput } from "../../../types/collection";
import { getCollectionsByCollectionSetId } from "../../../api/CollectionAPI";
import { useCollectionActions } from "./hook/useCollectionActions";
import { useCollectionLocalActions } from "./hook/useCollectionLocalActions";
import { useCollectionState } from "./hook/useCollectionState";
import { useLoginUser } from "../../../hooks/useLoginUser";
import CollectionItem from "./CollectionItem";
import ItemList from "../layout/ItemList"; // 追加：共通化されたList
import { useCallback } from "react";

interface Props {
  collectionSetId: number;
  userId: number;
  isOwner: boolean;
}

const CollectionList: React.FC<Props> = ({ collectionSetId, userId, isOwner }) => {
  const state = useCollectionState();
  const { handleCollectionBatchUpsert, handleDelete, handleBatchDelete } =
    useCollectionActions(collectionSetId, state);
  const {
    handleLocalCreate,
    handleLocalUpdate,
    initLocalCollection,
    handleAddPendingCreation,
    toggleSelect,
  } = useCollectionLocalActions(state);

  const { loginUser } = useLoginUser();
  const [isSelecting, setIsSelecting] = useState(false);

  // 初期ロード
  useEffect(() => {
    (async () => {
      state.setLoading(true);
      const res = await getCollectionsByCollectionSetId(collectionSetId);
      state.setLoading(false);
      initLocalCollection(res);
    })();
  }, [collectionSetId, initLocalCollection]);

  const toggleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    state.setSelectedIds([]);
  };

  const renderItem = useCallback(
    (collection: Collection, isNew: boolean) => (
      <CollectionItem
        key={collection.id}
        collection={collection}
        userId={userId}
        isOwner={isOwner}
        isNew={isNew}
        isLogined={loginUser != null}
        errorMessages={state.updateErrors[collection.id]}
        onChange={(updated) => handleLocalUpdate(collection.id, updated)}
        onDelete={() => handleDelete(collection.id)}
      />
    ),
    [userId, isOwner, loginUser, handleLocalUpdate, handleDelete, state.updateErrors]
  );

  const renderPendingItem = useCallback(
    (collection: CollectionInput, index: number) => (
       <CollectionItem
        key={`new-${index}`}
        collection={collection}
        userId={userId}
        isOwner={isOwner}
        isNew={true}
        isLogined={loginUser != null}
        errorMessages={state.createErrors[index]}
        onChange={(updated) => handleLocalCreate(index, updated)}
        onDelete={() => {
          state.setPendingCreations((prev) => prev.filter((_, i) => i !== index));
        }}
      />
    ),
    [userId, isOwner, loginUser, handleLocalCreate, state]
  );

  return (
    <ItemList<Collection, CollectionInput>
      items={state.collections}
      loading={state.loading}
      errorMessage={state.errorMessage}
      pendingCreations={state.pendingCreations}
      selectedIds={state.selectedIds}
      isSelecting={isSelecting}
      isOwner={isOwner}
      hasPendingUpsert={state.pendingUpdates.length > 0}
      renderItem={renderItem}
      renderPendingItem={renderPendingItem}
      onToggleSelectMode={toggleSelectMode}
      toggleSelect={toggleSelect}
      onAddPendingCreation={handleAddPendingCreation}
      onBatchUpsert={handleCollectionBatchUpsert}
      onBatchDelete={() => handleBatchDelete(state.selectedIds)}
    />
  );
};

export default CollectionList;
