INSERT INTO user_question_stats (user_id, question_id, correct_count, wrong_count, is_last_correct, updated_at)
VALUES (
    $1, $2,
    CASE WHEN $3 = true THEN 1 ELSE 0 END,
    CASE WHEN $3 = false THEN 1 ELSE 0 END,
    $3, NOW()
)
ON CONFLICT (user_id, question_id) DO UPDATE SET
    correct_count = user_question_stats.correct_count + CASE WHEN $3 = true THEN 1 ELSE 0 END,
    wrong_count = user_question_stats.wrong_count + CASE WHEN $3 = false THEN 1 ELSE 0 END,
    is_last_correct = $3,
    updated_at = NOW()
RETURNING *;
