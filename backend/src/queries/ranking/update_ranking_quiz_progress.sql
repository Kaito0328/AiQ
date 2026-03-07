UPDATE ranking_quizzes
SET answered_question_ids = array_append(answered_question_ids, $2),
    correct_count = correct_count + $3,
    is_active = $4,
    completed_at = COALESCE($5, completed_at),
    updated_at = NOW()
WHERE id = $1
RETURNING id, user_id, collection_id, question_ids, answered_question_ids, total_questions, correct_count, started_at, completed_at, is_active, created_at, updated_at
