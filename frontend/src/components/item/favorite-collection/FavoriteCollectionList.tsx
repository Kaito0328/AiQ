import React, { useEffect, useState } from "react";
import { Collection } from "../../../types/collection";
import { useLoginUser } from "../../../hooks/useLoginUser";
import CollectionItem from "./CollectionItem";
import { useCallback } from "react";
import { getFavoriteCollections } from "../../../api/CollectionAPI";
import LoadingIndicator from "../../Loading/Loading";

interface Props {
  userId: number;
  isOwner: boolean;
}

const FavoriteCollectionList: React.FC<Props> = ({ userId, isOwner }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
  const { loginUser } = useLoginUser();

  // 初期ロード
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getFavoriteCollections(userId);
      setLoading(false);
      setCollections(res);
    })();
  }, [userId]);

  const renderItem = useCallback(
    (collection: Collection) => (
      <CollectionItem
        key={collection.id}
        collection={collection}
        userId={userId}
        isOwner={false}
        isLogined={loginUser != null}
      />
    ),
    [userId, isOwner, loginUser]
  );

  if (loading) return (
    <LoadingIndicator />
  );


  return (
    <div className="relative space-y-6">
      <>
        <ul className="space-y-4 mb-10 grid gap-6 lg:grid-cols-2 mr-4">
          {collections.map((collection) => (
            <li key={`existing-${collection.id}`} className="relative">
                <div className="flex items-start gap-4">
                  {renderItem(collection)}
                </div>
            </li>
          ))}
        </ul>
      </>
  </div>
  );
};

export default FavoriteCollectionList;
