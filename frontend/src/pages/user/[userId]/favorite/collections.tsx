import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FavoriteCollectionList from "../../../../components/item/favorite-collection/FavoriteCollectionList";
import { useUser } from "../../../../hooks/useUser";
import UserHeader from "../../../../components/User/UserHeader";
import { CollectionSet } from "../../../../types/collectionSet";
import { getCollectionSet } from "../../../../api/CollectionSetAPI";
import PageContainer from "../../../../components/item/layout/PageContainer";
import SectionCard from "../../../../components/item/layout/SectionCard";
import SectionTitle from "../../../../components/item/layout/SectionTitle";

interface CollectionPageProps {
  collectionSet?: CollectionSet;
}

const FavoriteCollectionPage: React.FC<CollectionPageProps> = ({ collectionSet: propCollectionSet }) => {
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
    <PageContainer backgroundClassName="bg-gradient-to-br from-blue-100 to-blue-300">
      {/* ユーザーヘッダー */}
      <UserHeader 
        user={user} 
        loading={loading} 
        errorMessage={errorMessage} 
        onFollowStatusChange={onFollowStatusChange} 
      />

      {/* コレクション一覧 */}
      <SectionCard className="backdrop-blur-md bg-white/80 rounded-2xl">
        <SectionTitle>コレクション一覧</SectionTitle>
        <FavoriteCollectionList 
          isOwner={user?.self ?? false}
          userId={Number(user?.id)}
        />
      </SectionCard>
    </PageContainer>
  );
};

export default FavoriteCollectionPage;
