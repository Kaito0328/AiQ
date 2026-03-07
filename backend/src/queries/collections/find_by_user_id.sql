SELECT id, user_id, name, description_text, is_open, default_mode, created_at, updated_at
FROM collections
WHERE user_id = $1
ORDER BY created_at DESC;