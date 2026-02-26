INSERT INTO users (username, password, is_official)
VALUES ($1, $2, FALSE)
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
    updated_at