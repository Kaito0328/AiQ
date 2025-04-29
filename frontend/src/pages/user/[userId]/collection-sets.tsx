import React from "react";
import { useParams } from "react-router-dom";
import CollectionSetList from "../../../components/item/collectionSet/CollectionSetList";
import { useUser } from "../../../hooks/useUser";
import UserHeader from "../../../components/User/UserHeader";
import PageContainer from "../../../components/item/layout/PageContainer";
import SectionCard from "../../../components/item/layout/SectionCard";
import SectionTitle from "../../../components/item/layout/SectionTitle";

const CollectionSetPage: React.FC = () => {
  const { userId } = useParams();
  const { user, loading, errorMessage, onFollowStatusChange } = useUser(userId);

  return (
    <PageContainer backgroundClassName="bg-gradient-to-br from-green-100 to-green-300">
      {/* ユーザーヘッダー */}
      <UserHeader
        user={user}
        loading={loading}
        errorMessage={errorMessage}
        onFollowStatusChange={onFollowStatusChange}
      />

      {user && (
        <SectionCard className="backdrop-blur-md bg-white/80 rounded-2xl">
          <SectionTitle>コレクションセット一覧</SectionTitle>
          <div className="grid gap-6 md:grid-cols-2">
            <CollectionSetList
              userId={Number(user.id)}
              isOwner={user.self}
            />
          </div>
        </SectionCard>
      )}
    </PageContainer>
  );
};

export default CollectionSetPage;
