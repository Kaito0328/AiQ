import React from "react";
import { useParams } from "react-router-dom";
import FavoriteCollectionList from "../../../../components/LearningItem/collection/favorite-collection/FavoriteCollectionList";
import { useUser } from "../../../../hooks/useUser";
import UserHeader from "../../../../components/User/UserHeader";
import Page from "../../../../components/containerComponents/Page";


const FavoriteCollectionPage: React.FC = () => {
  const { userId } = useParams();
  const { user, loading, errorMessage, onFollowStatusChange } = useUser(Number(userId));


  return (
    <Page>
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
              <FavoriteCollectionList 
                userId={Number(user?.id)}
              />
            </div>
          )}
        </div>
      </div>

    </Page>

  );
};

export default FavoriteCollectionPage;
