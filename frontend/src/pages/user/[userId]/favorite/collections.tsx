import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FavoriteCollectionList from "../../../../components/LearningItem/collection/favorite-collection/FavoriteCollectionList";
import { useUser } from "../../../../hooks/useUser";
import UserHeader from "../../../../components/User/UserHeader";
import { CollectionSet } from "../../../../types/collectionSet";
import { getCollectionSet } from "../../../../api/CollectionSetAPI";
import PageContainer from "../../../../components/LearningItem/common/PageContainer";
import SectionCard from "../../../../components/LearningItem/common/SectionCard";
import SectionTitle from "../../../../components/LearningItem/common/SectionTitle";
import Page from "../../../../components/containerComponents/Page";

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
    <Page>
      <PageContainer>
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
            userId={Number(user?.id)}
          />
        </SectionCard>
      </PageContainer>
    </Page>

  );
};

export default FavoriteCollectionPage;
