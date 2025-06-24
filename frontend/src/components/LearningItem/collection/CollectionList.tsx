import React, { useEffect } from "react";
import { Collection, CollectionInput } from "../../../types/collection";
import { useCollectionAPIActions } from "./hook/action/useCollectionAPIActions";
import { useCollectionLocalActions } from "./hook/action/useCollectionLocalActions";
import { useLoginUser } from "../../../hooks/useLoginUser";
import ItemList from "../common/ItemList"; // 追加：共通化されたList
import { useCallback } from "react";
import ItemCard from "./CollectionCard/ItemCard";
import { useCollectionLocalState } from "./hook/state/useCollectionLocalState";
import { useCollectionAPIState } from "./hook/state/useCollectionAPIState";
import { useCollectionUIState } from "./hook/state/useCollectionUIState";
import { useUIAction } from "./hook/action/useCollectionUIAction";
import NewItemCard from "./CollectionCard/NewItemCard";
import AllDescriptionToggleButton from "../common/Button/AllDescriptionToggleButton";
import { useCollectionFavoriteActions } from "./hook/action/useCollectionFavoriteAction";

interface Props {
  collectionSetId: number;
  userId: number;
  isOwner: boolean;
}

const CollectionList: React.FC<Props> = ({ collectionSetId, userId, isOwner }) => {
  const localState = useCollectionLocalState();
  const apiState = useCollectionAPIState();
  const uiState = useCollectionUIState(apiState.collections, localState.pendingUpdates);

  const {
    initCollections,
    handleCollectionBatchUpsert,
    handleDelete,
    handleBatchDelete,
  } = useCollectionAPIActions(collectionSetId, apiState);

  const {
    handleFavorite
  } = useCollectionFavoriteActions(apiState);

  const {
    handleLocalCreate,
    handleLocalUpdate,
    handleAddPendingCreation,
    toggleSelect,
    clearFailedPendingUpdates,
    clearFailedPendingCreates,
  } = useCollectionLocalActions(localState);

  const {
    toggleVisibility,
    setAllVisibility,
    toggleSelectMode,
    markAsSaved,
    toUnSaved,
  } = useUIAction(uiState);

  const { loginUser } = useLoginUser();

  // 初期ロード
  useEffect(() => {
    if (!userId) return;
    initCollections();
  }, [initCollections, userId]);

  const onBatchUpsert = async () => {
    const res = await handleCollectionBatchUpsert(localState.pendingCreations, localState.pendingUpdates);
    clearFailedPendingUpdates(res.failedUpdates);
    clearFailedPendingCreates(res.failedCreates);
    markAsSaved(res.failedUpdates);
  }

  const AddPendingChanges = useCallback((id: number, updated: CollectionInput) => {
    handleLocalUpdate(id, updated);
    toUnSaved(id);
  }, [handleLocalUpdate, toUnSaved]);

  const renderItem = useCallback(
    (collection: Collection) => (
      <ItemCard
        key={collection.id}
        collection={collection}
        userId={userId}
        isOwner={isOwner}
        isLogin={loginUser != null}
        errorMessages={apiState.updateErrors[collection.id]}
        AddPendingChanges={(updated) => AddPendingChanges(collection.id, updated)}
        onDelete={() => handleDelete(collection.id)}
        onDescriptionToggle={() => toggleVisibility(collection.id)}
        onFavoriteToggle={() => handleFavorite(collection.id, collection.favorite)}
        isDescriptionVisible={uiState.visibilityMap[collection.id]}
        isSaved={uiState.savedMap[collection.id] ?? true}
      />
    ),
    [userId, isOwner, handleDelete, apiState.updateErrors, handleFavorite, toggleVisibility, uiState.visibilityMap, AddPendingChanges, uiState.savedMap, loginUser ]
  );

  const renderPendingItem = useCallback(
    (collection: CollectionInput, index: number) => (
       <NewItemCard
        key={`new-${index}`}
        collection={collection}
        isOwner={isOwner}
        errorMessages={apiState.createErrors[index]}
        AddPendingChanges={(created: CollectionInput) => handleLocalCreate(index, created)}
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

      <ItemList<Collection, CollectionInput>
        items={uiState.mergedCollections}
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

export default CollectionList;
