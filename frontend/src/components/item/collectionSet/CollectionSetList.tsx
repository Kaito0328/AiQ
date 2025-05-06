import React, { useEffect, useState } from "react";
import { getCollectionSetsByUserId } from "../../../api/CollectionSetAPI";
import { useCollectionSetActions } from "./hook/useCollectionSetActions";
import { useCollectionSetLocalActions } from "./hook/useCollectionSetLocalActions";
import { useCollectionSetState } from "./hook/useCollectionSetState";
import CollectionSetItem from "./CollectionSetItem";
import ItemList from "../layout/ItemList"; // 汎用リスト

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

  useEffect(() => {
    if (!userId) return;

    (async () => {
      state.setLoading(true);
      const res = await getCollectionSetsByUserId(userId);
      initLocalCollectionSet(res);
      state.setLoading(false);
    })();

  }, [userId, initLocalCollectionSet]);

  const handleCreateDelete = (index: number) => {
    state.setPendingCreations((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    state.setSelectedIds([]);
  };

  return (
    <ItemList
      items={state.collectionSets}
      loading={state.loading}
      errorMessage={state.errorMessage}
      pendingCreations={state.pendingCreations}
      selectedIds={state.selectedIds}
      isSelecting={isSelecting}
      isOwner={isOwner}
      hasPendingUpsert={state.pendingUpdates.length > 0}
      onToggleSelectMode={toggleSelectMode}
      toggleSelect={toggleSelect}
      onAddPendingCreation={handleAddPendingCreation}
      onBatchUpsert={handleCollectionSetBatchUpsert}
      onBatchDelete={() => handleBatchDelete(state.selectedIds)}
      renderItem={(collectionSet, isNew) => (
        <CollectionSetItem
          collectionSet={collectionSet}
          userId={userId}
          isOwner={isOwner}
          isNew={isNew}
          errorMessages={state.updateErrors[collectionSet.id]}
          onChange={(updated) => handleLocalUpdate(collectionSet.id, updated)}
          onDelete={() => handleDelete(collectionSet.id)}
        />
      )}
      renderPendingItem={(collectionSet, index) => (
        <CollectionSetItem
          collectionSet={collectionSet}
          userId={userId}
          isOwner={isOwner}
          isNew={true}
          errorMessages={state.createErrors[index]}
          onChange={(created) => handleLocalCreate(index, created)}
          onDelete={() => handleCreateDelete(index)}
        />
      )}
    />
  );
};

export default CollectionSetList;
