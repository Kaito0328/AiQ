INSERT INTO collection_sets (user_id, name, description_text, is_open)
VALUES ($1, $2, $3, $4)
RETURNING id, user_id, name, description_text, is_open, created_at, updated_at;