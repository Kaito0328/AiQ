import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CollectionList from "../../../../../components/collection/CollectionList";
import { useUser } from "../../../../../hooks/useUser";
import UserHeader from "../../../../../components/User/UserHeader";
import { CollectionSet } from "../../../../../types/collectionSet";
import { getCollectionSet } from "../../../../../api/CollectionSetAPI";
import CollectionSetHeader from "../../../../../components/collectionSet/CollectionSetHeader";

interface CollectionPageProps {
  collectionSet?: CollectionSet;
}

const CollectionPage: React.FC<CollectionPageProps> = ({ collectionSet: propCollectionSet }) => {
  const { collectionSetId, userId } = useParams();
  const { user, loading, errorMessage } = useUser(userId);
  const [collectionSet, setCollectionSet] = useState<CollectionSet | undefined>(propCollectionSet);

  useEffect(() => {
    const fetchCollectionSet = async () => {
      console.log("a");
      if (!collectionSetId || propCollectionSet || collectionSet) return;
      const res = await getCollectionSet(Number(collectionSetId));
      setCollectionSet(res);
    };
    fetchCollectionSet();
  }, [collectionSetId, propCollectionSet, collectionSet]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <UserHeader user={user} loading={loading} errorMessage={errorMessage} />
      
      {collectionSet && <CollectionSetHeader collectionSet={collectionSet} isOwner={user? user.self: false} />}
      
      <h2 className="text-2xl font-bold mb-4 mt-4">コレクション一覧</h2>
      <CollectionList 
        collectionSetId={Number(collectionSetId)}
        isOwner={user?.self ?? false}
        userId={Number(user?.id)}
      />
    </div>
  );
};

export default CollectionPage;
