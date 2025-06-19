import React, { useEffect, useState, useCallback } from "react";
import { Collection } from "../../../../types/collection";
import { getFavoriteCollections } from "../../../../api/CollectionAPI";
import { useLoginUser } from "../../../../hooks/useLoginUser";
import ItemCard from "../CollectionCard/ItemCard";
import ItemList from "../../common/ItemList";
import LoadingIndicator from "../../../Loading/Loading";
import { handleError } from "../../../../api/handleAPIError";

interface Props {
  userId: number;
}

const FavoriteCollectionList: React.FC<Props> = ({ userId }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { loginUser } = useLoginUser();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getFavoriteCollections(userId);
      setCollections(res);
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
        // 閲覧のみなので不要なpropは省略
        errorMessages={[]} 
        AddPendingChanges={() => {}}
        onDelete={() => {}}
        onDescriptionToggle={() => {}}
        onFavoriteToggle={() => {}}
        isDescriptionVisible={false}
        isSaved={true}
      />
    ),
    [userId, loginUser]
  );

  if (loading) return <LoadingIndicator />;

  return (
    <ItemList<Collection, never>
      items={collections}
      loading={false}
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
  );
};

export default FavoriteCollectionList;
