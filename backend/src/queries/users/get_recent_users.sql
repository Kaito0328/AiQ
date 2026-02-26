-- $1: 自分のID, $2: 取得数(LIMIT), $3: 開始位置(OFFSET)
SELECT 
    u.id,
    u.username,
    COALESCE(s.follower_count, 0) AS "follower_count!",
    COALESCE(s.following_count, 0) AS "following_count!",
    EXISTS (
        SELECT 1 FROM user_follows 
        WHERE follower_id = $1 AND followee_id = u.id
    ) AS "is_following!",
    EXISTS (
        SELECT 1 FROM user_follows 
        WHERE follower_id = u.id AND followee_id = $1
    ) AS "is_followed!",
    (u.id = $1) AS "is_self!" -- 一覧には自分は含めない予定ですが、SQLの構造を統一するために残します
FROM users u
LEFT JOIN user_stats s ON u.id = s.user_id
WHERE u.id != $1 -- 自分自身は除外
ORDER BY u.created_at DESC
LIMIT $2 OFFSET $3;