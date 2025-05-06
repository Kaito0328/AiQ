import React from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { FaEdit, FaPlay, FaExclamationTriangle, FaUserPlus, FaUserCheck } from "react-icons/fa";
import { User } from "../../types/user";
import { followUser, unfollowUser } from "../../api/Follow";
import { useLoginUser } from "../../hooks/useLoginUser";
import Paths from "../../routes/Paths";

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
    <div className="max-w-lg mx-auto mt-3 bg-white p-6 rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-2xl border border-gray-200">
      {/* ユーザー情報 */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {user.official ? "✅ 公式ユーザー" : user.username}
          </h1>
          <div className="flex space-x-6 mt-2 text-sm text-gray-600">
            <p>フォロワー: {user.followerCount}</p>
            <p>フォロー中: {user.followingCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        {loginUser && user.self && (
          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition">
            <FaEdit className="mr-2" /> プロフィール編集
          </button>
        )}

        {/* フォローボタン：ログインユーザーかつ他人 */}
        {loginUser && !user.self && (
          <button
            className={`flex items-center px-4 py-2 rounded-lg shadow-md transition transform hover:scale-110 ${
              user.following ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onClick={handleFollowToggle}
          >
            {user.following ? (
              <>
                <FaUserCheck className="mr-2" /> フォロー中
              </>
            ) : (
              <>
                <FaUserPlus className="mr-2" /> フォロー
              </>
            )}
          </button>
        )}

        {/* クイズ開始ボタン：常に表示 */}
        <button
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition transform hover:scale-110"
          onClick={handleNavigateToQuizOption}
        >
          <FaPlay className="mr-2" /> クイズを開始
        </button>
      </div>
    </div>
  );
};

export default UserHeader;
