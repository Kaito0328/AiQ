import { User } from '../types/user';
import { fetchFromAPI } from './api';

// フォローする
export const followUser = async (targetUserId: number): Promise<void> => {
  await fetchFromAPI(
    `/user/follow/${targetUserId}`,
    {
      method: 'POST',
    },
    true,
  );
};

// フォロー解除
export const unfollowUser = async (targetUserId: number): Promise<void> => {
  await fetchFromAPI(
    `/user/unfollow/${targetUserId}`,
    {
      method: 'DELETE',
    },
    true,
  );
};

// フォロワー一覧取得
export const getFollowers = async (userId: number): Promise<User[]> => {
  const response = await fetchFromAPI(`/user/${userId}/followers`, {}, true);
  return response.json();
};

// フォロー中ユーザー一覧取得
export const getFollowees = async (userId: number): Promise<User[]> => {
  const response = await fetchFromAPI(`/user/${userId}/followees`, {}, true);
  return response.json();
};
