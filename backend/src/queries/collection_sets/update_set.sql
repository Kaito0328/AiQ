UPDATE collection_sets
SET name = $1, description_text = $2, is_open = $3, updated_at = NOW()
WHERE id = $4 AND user_id = $5
RETURNING id, user_id, name, description_text, is_open, created_at, updated_at;