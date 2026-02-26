SELECT 
    u.id,
    u.username,
    u.display_name,
    u.bio,
    u.icon_url,
    COALESCE(s.follower_count, 0) AS "follower_count!",
    COALESCE(s.following_count, 0) AS "following_count!",
    (SELECT COUNT(*) FROM collections WHERE user_id = u.id) AS "collection_count!",
    (SELECT COUNT(*) FROM collection_sets WHERE user_id = u.id) AS "set_count!",
    COALESCE(EXISTS (
        SELECT 1 FROM user_follows 
        WHERE follower_id = $1::uuid AND followee_id = u.id
    ), false) AS "is_following!",
    COALESCE(EXISTS (
        SELECT 1 FROM user_follows 
        WHERE follower_id = u.id AND followee_id = $1::uuid
    ), false) AS "is_followed!",
    COALESCE(u.id = $1::uuid, false) AS "is_self!",
    u.is_official AS "is_official!"
FROM users u
LEFT JOIN user_stats s ON u.id = s.user_id
WHERE u.id = $2;