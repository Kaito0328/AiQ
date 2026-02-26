UPDATE user_stats
SET follower_count = GREATEST(0, follower_count - 1)
WHERE user_id = $1