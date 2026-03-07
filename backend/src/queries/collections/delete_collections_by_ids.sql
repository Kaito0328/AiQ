DELETE FROM collections WHERE user_id = $1 AND id = ANY($2)
