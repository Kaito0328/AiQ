import React, { useEffect, useState, useCallback } from "react";
import { Collection } from "../../../../types/collection";
import { getFavoriteCollections } from "../../../../api/CollectionAPI";
import { useLoginUser } from "../../../../hooks/useLoginUser";
import ItemCard from "../CollectionCard/ItemCard";
import ItemList from "../../common/ItemList";
import { handleError } from "../../../../api/handleAPIError";
import LoadingIndicator from "../../../common/Loading/loadingIndicator";
import AllDescriptionToggleButton from "../../common/Button/AllDescriptionToggleButton";
import { useUIAction } from "../hook/action/useCollectionUIAction";
import { useCollectionUIState } from "../hook/state/useCollectionUIState";
import { useCollectionAPIState } from "../hook/state/useCollectionAPIState";
import { useCollectionFavoriteActions } from "../hook/action/useCollectionFavoriteAction";

interface Props {
  userId: number;
}

const FavoriteCollectionList: React.FC<Props> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { loginUser } = useLoginUser();

    const apiState = useCollectionAPIState();
    const uiState = useCollectionUIState(apiState.collections, []);

    const {
      setAllVisibility,
    } = useUIAction(uiState);

      const {
        handleFavorite
      } = useCollectionFavoriteActions(apiState);
  

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getFavoriteCollections(userId);
        console.log(res)
      apiState.setCollections(res);
      } catch (e) {
        setErrorMessage(handleError(e));
      } finally {
      setLoading(false);
      }
    })();
  }, [userId]);

  const renderItem = useCallback(
    (collection: Collection) => (
      <ItemCard
        key={collection.id}
        collection={collection}
        userId={userId}
        isOwner={false}
        isLogin={loginUser != null}
        errorMessages={[]} 
        AddPendingChanges={() => {}}
        onDelete={() => {}}
        onDescriptionToggle={() => {}}
        onFavoriteToggle={() => handleFavorite(collection.id, collection.favorite)}
        isDescriptionVisible={false}
        isSaved={true}
      />
    ),
    [userId, loginUser, handleFavorite]
  );

  if (loading) return <LoadingIndicator />;

  return (
    <div>
      <div className="w-full max-w-4xl flex justify-end mb-5">
        <AllDescriptionToggleButton
          isVisible={uiState.allVisible}
          onToggle={() => setAllVisibility()}
        />
      </div>
    <ItemList<Collection, never>
      items={apiState.collections}
      loading={apiState.loading || loading}
      errorMessage={errorMessage}
      pendingCreations={[]}
      selectedIds={[]}
      isSelecting={false}
      isOwner={false}
      hasPendingUpsert={false}
      renderItem={renderItem}
      renderPendingItem={() => null}
      onToggleSelectMode={() => {}}
      toggleSelect={() => {}}
      onAddPendingCreation={() => {}}
      onBatchUpsert={() => {}}
      onBatchDelete={() => {}}
    />
  </div>
  );
};

export default FavoriteCollectionList;
