import React from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import { User } from "../../types/user";
import { followUser, unfollowUser } from "../../api/Follow";
import { useLoginUser } from "../../hooks/useLoginUser";
import Paths from "../../routes/Paths";
import FollowButton from "./common/FollowButton";
import QuizStartButton from "./common/QuizStarButton";
import ProfileEditButton from "./common/ProfileEditButton";
import Text from "../baseComponents/Text";
import BaseLabel from "../baseComponents/BaseLabel";
import { SizeKey } from "../../style/size";
import { FontWeightKey } from "../../style/fontWeight";
import BaseCard from "../containerComponents/BaseCard";
import { ShadowKey } from "../../style/shadow";
import { CoreColorKey, ColorPropertyKey } from "../../style/colorStyle";

interface UserHeaderProps {
  user: User | null;
  loading?: boolean;
  errorMessage?: string | null;
  onFollowStatusChange: (follow: boolean) => void;
}

// ...省略（インポートなど）

const UserHeader: React.FC<UserHeaderProps> = ({ user, loading, errorMessage, onFollowStatusChange }) => {
  const navigate = useNavigate();
  const { loginUser } = useLoginUser();

  const handleFollowToggle = async () => {
    if (user?.following) {
      await unfollowUser(user.id);
      onFollowStatusChange(false);
    } else {
      await followUser(user!.id);
      onFollowStatusChange(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-100 animate-pulse rounded-lg shadow-md">
        <p className="text-gray-500">ユーザー情報を読み込み中...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center h-40 bg-red-100 rounded-lg shadow-md border border-red-300 px-4">
        <FaExclamationTriangle className="text-red-500 mr-2" />
        <p className="text-red-700 font-medium">{errorMessage}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-200 rounded-lg shadow-md">
        <p className="text-gray-500">ユーザー情報が見つかりませんでした</p>
      </div>
    );
  }

  const handleNavigateToQuizOption = () => {
    navigate(generatePath(Paths.QUIZ_OPTION, {userId: user.id}));
  };

  return (
    <BaseCard
    style={{
      size: {
        sizeKey: SizeKey.XL,
        full_width: false
      },
      shadow: {
        shadowKey: ShadowKey.LG
      }

    }}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center w-full justify-center">
          <div className="w-full">
            <div className="font-bold">
              <BaseLabel
                label={user.official ? "公式ユーザー" : user.username}
                style={{
                  color: {
                    colorKey: CoreColorKey.Base,
                    properties: [ColorPropertyKey.Label],
                    variants: []
                  },
                  size: {
                    sizeKey: SizeKey.LG
                  },
                  fontWeightKey: FontWeightKey.Bold
                }}
              />
            </div>
            <div className="flex mt-2 gap-5">
              <div className="flex gap-2">
                  <Text
                    text={"" + user.followerCount}
                    style={{
                      fontWeightKey: FontWeightKey.Bold
                    }}
                  />  
                
                <Text
                  text={"フォロワー"}
                  style={{
                    color: {
                      colorKey: CoreColorKey.Secondary
                    },
                  }}
                />

              </div>
              <div className="flex items-center gap-2">
                <Text
                  text={"" + user.followingCount}
                  style={{
                    fontWeightKey: FontWeightKey.Bold
                  }}
                />  
                
                <Text
                  text={"フォロー"}
                  style={{
                    color: {
                      colorKey: CoreColorKey.Secondary
                    },
                  }}
                />

              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-6">
          {loginUser &&  (
            <div>
              { user.self ? (
                <ProfileEditButton
                  navigateProfile={() => navigate(Paths.USER_PROFILE)}
                />
              ) : (
                <FollowButton
                  handleFollow={handleFollowToggle}
                  isFollowing={user.following}
                />
              )}
            </div>
          )}
          <div>
            <QuizStartButton
              navigateQuizStart={handleNavigateToQuizOption}
            />
          </div>

        </div>

      </div>
      
    </BaseCard>
  );
};

export default UserHeader;
