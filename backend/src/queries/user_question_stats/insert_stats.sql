INSERT INTO user_question_stats (user_id, question_id, correct_count, wrong_count, is_last_correct)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (user_id, question_id) DO UPDATE SET
    correct_count = user_question_stats.correct_count + EXCLUDED.correct_count,
    wrong_count = user_question_stats.wrong_count + EXCLUDED.wrong_count,
    is_last_correct = EXCLUDED.is_last_correct,
    updated_at = NOW()