UPDATE casual_quizzes
SET
    answered_question_ids = $2,
    correct_count = $3,
    elapsed_time_millis = $4,
    is_active = $5,
    updated_at = NOW()
WHERE id = $1
RETURNING *;
