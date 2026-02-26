SELECT id, user_id, name, description_text, is_open, created_at, updated_at
FROM collection_sets
WHERE user_id = $1
ORDER BY updated_at DESC;