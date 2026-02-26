SELECT 
    c.id,
    c.user_id,
    c.name,
    c.description_text,
    c.created_at,
    c.updated_at,
    c.is_open,
    COALESCE(u.username, '') as "author_name!",
    u.icon_url as author_icon_url,
    u.is_official as "is_official!",
    (SELECT favorite_count FROM collection_stats WHERE collection_id = c.id)::bigint as favorite_count,
    (SELECT question_count FROM collection_stats WHERE collection_id = c.id)::bigint as question_count,
    COALESCE(EXISTS (
        SELECT 1 FROM favorite_collections 
        WHERE user_id = $2::uuid AND collection_id = c.id
    ), false) as "is_favorited!",
    (
        SELECT r.rank FROM (
            SELECT user_id, RANK() OVER (ORDER BY MAX(score) DESC) as rank
            FROM ranking_records
            WHERE collection_id = c.id
            GROUP BY user_id
        ) r WHERE r.user_id = $2::uuid
    ) as user_rank
FROM collections c
JOIN users u ON c.user_id = u.id
WHERE c.user_id = $1
ORDER BY c.created_at DESC;
