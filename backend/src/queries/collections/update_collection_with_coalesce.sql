UPDATE collections SET
    name = COALESCE($2, name),
    description_text = COALESCE($3, description_text),
    is_open = COALESCE($4, is_open),
    default_mode = COALESCE($5, default_mode),
    updated_at = NOW()
WHERE id = $1 AND user_id = $6
RETURNING *
