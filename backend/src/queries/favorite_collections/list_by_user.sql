SELECT 
    c.id, 
    c.user_id, 
    c.name, 
    c.description_text, 
    c.is_open, 
    c.created_at, 
    c.updated_at,
    u.username as author_name,
    u.icon_url as author_icon_url,
    u.is_official as "is_official!",
    COALESCE(s.favorite_count, 0)::bigint as favorite_count,
    COALESCE(s.question_count, 0)::bigint as question_count,
    TRUE as "is_favorited!",
    (
        SELECT r.rank FROM (
            SELECT user_id, RANK() OVER (ORDER BY MAX(score) DESC) as rank
            FROM ranking_records
            WHERE collection_id = c.id
            GROUP BY user_id
        ) r WHERE r.user_id = $1::uuid
    ) as user_rank
FROM favorite_collections fc
JOIN collections c ON fc.collection_id = c.id
JOIN users u ON c.user_id = u.id
LEFT JOIN collection_stats s ON c.id = s.collection_id
WHERE fc.user_id = $1
ORDER BY fc.created_at DESC;
