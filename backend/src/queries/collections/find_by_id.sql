SELECT id, user_id, name, description_text, is_open, default_mode, created_at, updated_at
FROM collections
WHERE id = $1;