WITH RankedScores AS (
    SELECT 
        user_id,
        MAX(score) as max_score,
        MAX(correct_count) as max_correct,
        MIN(total_time_millis) as min_time
    FROM ranking_records
    WHERE collection_id = $2
    GROUP BY user_id
),
Ranks AS (
    SELECT 
        user_id,
        RANK() OVER (ORDER BY max_score DESC, max_correct DESC, min_time ASC) as rank
    FROM RankedScores
)
SELECT rank FROM Ranks WHERE user_id = $1
