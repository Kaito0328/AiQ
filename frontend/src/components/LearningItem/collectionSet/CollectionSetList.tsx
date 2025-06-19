import React, { useEffect } from "react";
import { useAPIActions } from "./hook/action/useAPIActions";
import { useLocalActions } from "./hook/action/useLocalActions";
import ItemList from "../common/ItemList"; // 追加：共通化されたList
import { useCallback } from "react";
import ItemCard from "./CollectionSetCard/ItemCard";
import { useLocalState } from "./hook/state/useLocalState";
import { useAPIState } from "./hook/state/useAPIState";
import { useUIState } from "./hook/state/useUIState";
import { useUIAction } from "./hook/action/useUIAction";
import NewItemCard from "./CollectionSetCard/NewItemCard";
import AllDescriptionToggleButton from "../common/Button/AllDescriptionToggleButton";
import { CollectionSet, CollectionSetInput } from "../../../types/collectionSet";

interface Props {
  userId: number;
  isOwner: boolean;
}

const CollectionSetList: React.FC<Props> = ({ userId, isOwner }) => {
  const localState = useLocalState();
  const apiState = useAPIState();
  const uiState = useUIState(apiState.collectionSets, localState.pendingUpdates);

  const {
    initCollections,
    handleCollectionBatchUpsert,
    handleDelete,
    handleBatchDelete,
  } = useAPIActions(apiState);

  const {
    handleLocalCreate,
    handleLocalUpdate,
    handleAddPendingCreation,
    toggleSelect,
    clearFailedPendingUpdates,
    clearFailedPendingCreates,
  } = useLocalActions(localState);

  const {
    toggleVisibility,
    setAllVisibility,
    toggleSelectMode,
    markAsSaved,
    toUnSaved,
  } = useUIAction(uiState);

  // 初期ロード
  useEffect(() => {
    if (!userId) return;
    initCollections(userId);
  }, [initCollections, userId]);

  const onBatchUpsert = async () => {
    const res = await handleCollectionBatchUpsert(localState.pendingCreations, localState.pendingUpdates);
    clearFailedPendingUpdates(res.failedUpdates);
    clearFailedPendingCreates(res.failedCreates);
    markAsSaved(res.failedUpdates);
  }

  const AddPendingChanges = useCallback((id: number, updated: CollectionSetInput) => {
    handleLocalUpdate(id, updated);
    toUnSaved(id);
  }, [handleLocalUpdate, toUnSaved]);

  const renderItem = useCallback(
    (collectionSet: CollectionSet) => (
      <ItemCard
        key={collectionSet.id}
        collectionSet={collectionSet}
        userId={userId}
        isOwner={isOwner}
        errorMessages={apiState.updateErrors[collectionSet.id]}
        AddPendingChanges={(updated) => AddPendingChanges(collectionSet.id, updated)}
        onDelete={() => handleDelete(collectionSet.id)}
        onDescriptionToggle={() => toggleVisibility(collectionSet.id)}
        isDescriptionVisible={uiState.visibilityMap[collectionSet.id]}
        isSaved={uiState.savedMap[collectionSet.id] ?? true}
      />
    ),
    [userId, isOwner, handleDelete, apiState.updateErrors, toggleVisibility, uiState.visibilityMap, AddPendingChanges, uiState.savedMap ]
  );

  const renderPendingItem = useCallback(
    (collectionSet: CollectionSetInput, index: number) => (
       <NewItemCard
        key={`new-${index}`}
        collectionSet={collectionSet}
        isOwner={isOwner}
        errorMessages={apiState.createErrors[index]}
        AddPendingChanges={(created: CollectionSetInput) => handleLocalCreate(index, created)}
        onDelete={() => (index)}
      />
    ),
    [isOwner, handleLocalCreate, apiState.createErrors]
  );

  return (
    <div>
      <div className="w-full max-w-4xl flex justify-end mb-5">
        <AllDescriptionToggleButton
          isVisible={uiState.allVisible}
          onToggle={() => setAllVisibility()}
        />
      </div>

      <ItemList<CollectionSet, CollectionSetInput>
        items={uiState.mergedCollectionSets}
        loading={apiState.loading}
        errorMessage={apiState.errorMessage}
        pendingCreations={localState.pendingCreations}
        selectedIds={localState.selectedIds}
        isSelecting={uiState.isSelecting}
        isOwner={isOwner}
        hasPendingUpsert={localState.pendingUpdates.length > 0}
        renderItem={renderItem}
        renderPendingItem={renderPendingItem}
        onToggleSelectMode={toggleSelectMode}
        toggleSelect={toggleSelect}
        onAddPendingCreation={handleAddPendingCreation}
        onBatchUpsert={onBatchUpsert}
        onBatchDelete={() => handleBatchDelete(localState.selectedIds)}
      />
    </div>
  );
};

export default CollectionSetList;
