    UPDATE users
SET 
    username = COALESCE($1, username),
    display_name = COALESCE($2, display_name),
    bio = COALESCE($3, bio),
    icon_url = COALESCE($4, icon_url),
    updated_at = NOW()
WHERE id = $5
RETURNING
    id,
    username,
    email,
    password,
    display_name,
    bio,
    icon_url,
    is_official,
    created_at,
    updated_at;