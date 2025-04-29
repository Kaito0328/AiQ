import { fetchFromAPI } from './api';

// お気に入り追加
export const addFavoriteCollection = async (collectionId: number): Promise<void> => {
  await fetchFromAPI(
    `/user/favorites/${collectionId}`,
    {
      method: 'POST',
    },
    true,
  );
};

// お気に入り削除
export const removeFavoriteCollection = async (collectionId: number): Promise<void> => {
  await fetchFromAPI(
    `/user/favorites/${collectionId}`,
    {
      method: 'DELETE',
    },
    true,
  );
};
