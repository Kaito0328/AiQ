DELETE FROM casual_quizzes
WHERE id IN (
    SELECT id
    FROM casual_quizzes
    WHERE user_id = $1 AND is_active = true
    ORDER BY created_at ASC
    LIMIT 1
) AND (
    SELECT COUNT(*) FROM casual_quizzes WHERE user_id = $1 AND is_active = true
) >= $2
RETURNING *;
