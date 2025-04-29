import { useParams } from "react-router-dom";
import QuestionList from "../../../../../components/item/question/QuestionList";
import UserHeader from "../../../../../components/User/UserHeader";
import { useUser } from "../../../../../hooks/useUser";
import { Collection } from "../../../../../types/collection";
import React, { useEffect, useState } from "react";
import CollectionHeader from "../../../../../components/item/collection/CollectionHeader";
import { getCollection } from "../../../../../api/CollectionAPI";
import PageContainer from "../../../../../components/item/layout/PageContainer";
import SectionCard from "../../../../../components/item/layout/SectionCard";
import SectionTitle from "../../../../../components/item/layout/SectionTitle";

interface QuestionPageProps {
  collection?: Collection;
}

const QuestionPage: React.FC<QuestionPageProps> = ({ collection: propCollection }) => {
  const { userId, collectionId } = useParams<{ userId: string; collectionId: string }>();
  const { user, loading, errorMessage, onFollowStatusChange } = useUser(userId);
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
    <PageContainer backgroundClassName="bg-gradient-to-br from-pink-100 to-pink-300">
      {/* ユーザーヘッダー */}
      <UserHeader 
        user={user} 
        loading={loading} 
        errorMessage={errorMessage} 
        onFollowStatusChange={onFollowStatusChange} 
      />

      {/* コレクションセクション */}
      <SectionCard className="backdrop-blur-md bg-white/80 rounded-2xl">
        <SectionTitle>コレクション</SectionTitle>
        {collection ? (
          <CollectionHeader 
            collection={collection} 
            isOwner={user ? user.self : false} 
          />
        ) : (
          <p className="text-gray-500">コレクションが見つかりません。</p>
        )}
      </SectionCard>

      {/* 問題一覧セクション */}
      <SectionCard className="backdrop-blur-md bg-white/80 rounded-2xl">
        <SectionTitle>問題一覧</SectionTitle>
        <QuestionList 
          collectionId={Number(collectionId)} 
          userId={user?.id} 
          isOwner={user ? user.self : false} 
        />
      </SectionCard>
    </PageContainer>
  );
};

export default QuestionPage;
