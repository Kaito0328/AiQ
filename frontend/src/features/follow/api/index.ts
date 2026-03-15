import { apiClient } from '@/src/shared/api/apiClient';
import { User } from '@/src/entities/user';

/**
 * ユーザーをフォローする
 */
export const followUser = async (userId: string): Promise<void> => {
    if (typeof window !== 'undefined' && (localStorage.getItem('aiq_manual_offline') === 'true' || !navigator.onLine)) {
        const { syncManager } = await import('@/src/shared/api/SyncManager');
        await syncManager.addAction('FOLLOW_USER', { userId });
        return;
    }

    await apiClient<void>(`/users/${userId}/follow`, {
        method: 'POST',
        authenticated: true,
    });
};

/**
 * ユーザーのフォローを解除する
 */
export const unfollowUser = async (userId: string): Promise<void> => {
    if (typeof window !== 'undefined' && (localStorage.getItem('aiq_manual_offline') === 'true' || !navigator.onLine)) {
        const { syncManager } = await import('@/src/shared/api/SyncManager');
        await syncManager.addAction('UNFOLLOW_USER', { userId });
        return;
    }

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
