UPDATE collections
SET name = $1, description_text = $2, is_open = $3, default_mode = $4, updated_at = NOW()
WHERE id = $5 AND user_id = $6
RETURNING id, user_id, name, description_text, is_open, default_mode, created_at, updated_at;