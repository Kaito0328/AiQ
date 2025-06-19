import React from "react";
import { useParams } from "react-router-dom";
import CollectionSetList from "../../../components/LearningItem/collectionSet/CollectionSetList";
import { useUser } from "../../../hooks/useUser";
import UserHeader from "../../../components/User/UserHeader";
import PageContainer from "../../../components/LearningItem/common/PageContainer";

const CollectionSetPage: React.FC = () => {
  const { userId } = useParams();
  const { user, loading, errorMessage, onFollowStatusChange } = useUser(Number(userId));

  return (
    <PageContainer>
      {/* ユーザーヘッダー */}
      <UserHeader
        user={user}
        loading={loading}
        errorMessage={errorMessage}
        onFollowStatusChange={onFollowStatusChange}
      />

      {user && (
        <div>
          <CollectionSetList
            userId={Number(user.id)}
            isOwner={user.self}
          />
        </div>
      )}
    </PageContainer>
  );
};

export default CollectionSetPage;
