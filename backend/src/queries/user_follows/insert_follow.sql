INSERT INTO user_follows (follower_id, followee_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING