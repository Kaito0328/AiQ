import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CollectionList from "../../../../../components/LearningItem/collection/CollectionList";
import { useUser } from "../../../../../hooks/useUser";
import UserHeader from "../../../../../components/User/UserHeader";
import { CollectionSet } from "../../../../../types/collectionSet";
import { getCollectionSet } from "../../../../../api/CollectionSetAPI";
import CollectionSetHeader from "../../../../../components/LearningItem/collectionSet/CollectionSetHeader";
import Page from "../../../../../components/containerComponents/Page";

interface CollectionPageProps {
  collectionSet?: CollectionSet;
}

const CollectionPage: React.FC<CollectionPageProps> = ({ collectionSet: propCollectionSet }) => {
  const { collectionSetId, userId } = useParams();
  const { user, loading, errorMessage, onFollowStatusChange } = useUser(Number(userId));
  const [collectionSet, setCollectionSet] = useState<CollectionSet | undefined>(propCollectionSet);

  useEffect(() => {
    const fetchCollectionSet = async () => {
      if (!collectionSetId || propCollectionSet || collectionSet) return;
      const res = await getCollectionSet(Number(collectionSetId));
      setCollectionSet(res);
    };
    fetchCollectionSet();
  }, [collectionSetId, propCollectionSet, collectionSet]);

  return (
    <Page
      withBackBUtton={true}
      withScrollControls={true}
    >
      <div className="w-full  flex flex-col items-center">
        <div className="w-[90%] max-w-300 space-y-5">
          {/* ユーザーヘッダー */}
          <div>
                  <UserHeader 
            user={user} 
            loading={loading} 
            errorMessage={errorMessage} 
            onFollowStatusChange={onFollowStatusChange} 
          />
          </div>


          {/* コレクションセットヘッダー */}
          {collectionSet && (
              <CollectionSetHeader 
                collectionSet={collectionSet} 
                isOwner={user ? user.self : false} 
              />
          )}
          <div className="border-t pt-5">
            <CollectionList 
              collectionSetId={Number(collectionSetId)}
              isOwner={user?.self ?? false}
              userId={Number(user?.id)}
            />
          </div>
        </div>
      </div>
    </Page>

  );
};

export default CollectionPage;
