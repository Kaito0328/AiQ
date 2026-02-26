DELETE FROM favorite_collections
WHERE user_id = $1 AND collection_id = $2;
