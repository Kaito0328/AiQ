INSERT INTO favorite_collections (user_id, collection_id)
VALUES ($1, $2)
ON CONFLICT (user_id, collection_id) DO NOTHING;
