import { apiClient } from '@/src/shared/api/apiClient';
import { Collection } from '@/src/entities/collection';

/**
 * ユーザーのお気に入りコレクション一覧を取得
 */
export const listFavorites = async (userId: string): Promise<Collection[]> => {
    return await apiClient<Collection[]>(`/users/${userId}/favorites`, {
        authenticated: true,
    });
};

/**
 * コレクションをお気に入りに追加
 */
export const addFavorite = async (collectionId: string): Promise<void> => {
    await apiClient<void>(`/collections/${collectionId}/favorite`, {
        method: 'POST',
        authenticated: true,
    });
};

/**
 * コレクションをお気に入りから削除
 */
export const removeFavorite = async (collectionId: string): Promise<void> => {
    await apiClient<void>(`/collections/${collectionId}/favorite`, {
        method: 'DELETE',
        authenticated: true,
    });
};
