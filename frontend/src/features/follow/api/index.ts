import { apiClient } from '@/src/shared/api/apiClient';
import { User } from '@/src/entities/user';

/**
 * ユーザーをフォローする
 */
export const followUser = async (userId: string): Promise<void> => {
    await apiClient<void>(`/users/${userId}/follow`, {
        method: 'POST',
        authenticated: true,
    });
};

/**
 * ユーザーのフォローを解除する
 */
export const unfollowUser = async (userId: string): Promise<void> => {
    await apiClient<void>(`/users/${userId}/follow`, {
        method: 'DELETE',
        authenticated: true,
    });
};

/**
 * ユーザーのフォロワー一覧を取得
 */
export const getFollowers = async (userId: string): Promise<User[]> => {
    return await apiClient<User[]>(`/users/${userId}/followers`, {
        authenticated: true,
    });
};

/**
 * ユーザーがフォローしているユーザー一覧を取得
 */
export const getFollowees = async (userId: string): Promise<User[]> => {
    return await apiClient<User[]>(`/users/${userId}/followees`, {
        authenticated: true,
    });
};
