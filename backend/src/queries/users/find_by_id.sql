SELECT
    id,
    username,
    email,
    password,
    display_name,
    bio,
    icon_url,
    is_official,
    created_at,
    updated_at
FROM users WHERE id = $1