SELECT 
    u.id,
    u.username,
    u.display_name,
    u.bio,
    u.icon_url,
    COALESCE(s.follower_count, 0) as "follower_count!",
    COALESCE(s.following_count, 0) as "following_count!",
    (SELECT COUNT(*) FROM collections WHERE user_id = u.id) as "collection_count!",
    (SELECT COUNT(*) FROM collection_sets WHERE user_id = u.id) as "set_count!",
    COALESCE(EXISTS(SELECT 1 FROM user_follows WHERE follower_id = $1::uuid AND followee_id = u.id), false) as "is_following!",
    COALESCE(EXISTS(SELECT 1 FROM user_follows WHERE follower_id = u.id AND followee_id = $1::uuid), false) as "is_followed!",
    COALESCE(u.id = $1::uuid, false) as "is_self!",
    u.is_official as "is_official!"
FROM user_follows uf
JOIN users u ON uf.followee_id = u.id
LEFT JOIN user_stats s ON u.id = s.user_id
WHERE uf.follower_id = $2
ORDER BY uf.created_at DESC;
