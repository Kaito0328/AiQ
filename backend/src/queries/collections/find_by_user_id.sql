SELECT id, user_id, name, description_text, is_open, created_at, updated_at
FROM collections
WHERE user_id = $1;