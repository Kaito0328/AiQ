import { handleError } from '../../../../../api/handleAPIError';
import { useCollectionAPIState } from '../state/useCollectionAPIState';
import { addFavoriteCollection, removeFavoriteCollection } from '../../../../../api/FavoriteCollection';
import { useCallback } from 'react';

export const useCollectionFavoriteActions = (
  apiState: ReturnType<typeof useCollectionAPIState>,
) => {
  const {
    setCollections,
    setErrorMessage,
  } = apiState;

  const handleFavorite = useCallback(async (id: number, beforeFavorite: boolean) => {
    setCollections((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorite: !beforeFavorite } : item
      )
    );

    try {
      if (!beforeFavorite) {
        await addFavoriteCollection(id);
      } else {
        await removeFavoriteCollection(id);
      }
    } catch (e) {
      // エラー発生時に元の状態に戻す
      setCollections((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, favorite: beforeFavorite } : item
        )
      );
      setErrorMessage(handleError(e));
    }
  }, [setCollections, setErrorMessage]);


  return {
    handleFavorite,
  };
};
