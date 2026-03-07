INSERT INTO collections (user_id, name, description_text, is_open, default_mode)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, user_id, name, description_text, is_open, default_mode, created_at, updated_at;