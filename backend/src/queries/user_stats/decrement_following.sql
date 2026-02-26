UPDATE user_stats
SET following_count = GREATEST(0, following_count - 1)
WHERE user_id = $1