import React from "react";
import { useParams } from "react-router-dom";
import CollectionSetList from "../../../components/LearningItem/collectionSet/CollectionSetList";
import { useUser } from "../../../hooks/useUser";
import UserHeader from "../../../components/User/UserHeader";
import Page from "../../../components/containerComponents/Page";

const CollectionSetPage: React.FC = () => {
  const { userId } = useParams();
  const { user, loading, errorMessage, onFollowStatusChange } = useUser(Number(userId));

  return (
    <Page
      withBackBUtton={true}
      withScrollControls={true}
    >
      <div className="w-full  flex flex-col items-center">
        <div className="w-[90%] max-w-300 space-y-5">
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
        </div>
      </div>

    </Page>

  );
};

export default CollectionSetPage;
