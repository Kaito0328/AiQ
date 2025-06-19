import { useParams } from "react-router-dom";
import QuestionList from "../../../../../components/LearningItem/question/QuestionList";
import UserHeader from "../../../../../components/User/UserHeader";
import { useUser } from "../../../../../hooks/useUser";
import { Collection } from "../../../../../types/collection";
import React, { useEffect, useState } from "react";
import CollectionHeader from "../../../../../components/LearningItem/collection/CollectionHeader";
import { getCollection } from "../../../../../api/CollectionAPI";
import PageContainer from "../../../../../components/LearningItem/common/PageContainer";

interface QuestionPageProps {
  collection?: Collection;
}

const QuestionPage: React.FC<QuestionPageProps> = ({ collection: propCollection }) => {
  const { userId, collectionId } = useParams<{ userId: string; collectionId: string }>();
  const { user, loading, errorMessage, onFollowStatusChange } = useUser(Number(userId));
  const [collection, setCollection] = useState<Collection | undefined>(propCollection);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!collectionId) return;
      if (propCollection != null) {
        setCollection(propCollection);
        return;
      }

      const res = await getCollection(Number(collectionId));
      setCollection(res);
    };
    fetchCollection();
  }, [collectionId, propCollection]);

  return (
    <PageContainer>
      {/* ユーザーヘッダー */}
      <UserHeader 
        user={user} 
        loading={loading} 
        errorMessage={errorMessage} 
        onFollowStatusChange={onFollowStatusChange} 
      />

      {collection ? (
        <CollectionHeader 
          collection={collection} 
          isOwner={user ? user.self : false} 
        />
      ) : (
        <p className="text-gray-500">コレクションが見つかりません。</p>
      )}
      <div className="border-t pt-5">
        <QuestionList 
          collectionId={Number(collectionId)} 
          userId={user?.id} 
          isOwner={user ? user.self : false} 
        />

      </div>

    </PageContainer>
  );
};

export default QuestionPage;
