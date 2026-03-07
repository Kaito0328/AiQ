INSERT INTO collections (id, user_id, name, description_text, is_open, default_mode)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *
