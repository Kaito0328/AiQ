WITH ranked_scores AS (
    SELECT 
        user_id,
        MAX(score) as max_score
    FROM ranking_records
    WHERE collection_id = $1
    GROUP BY user_id
)
SELECT 
    rs.user_id,
    u.username as "username!",
    u.icon_url,
    rs.max_score as "score!",
    RANK() OVER (ORDER BY rs.max_score DESC) as "rank!"
FROM ranked_scores rs
JOIN users u ON rs.user_id = u.id
ORDER BY rs.max_score DESC
LIMIT 10;
