UPDATE casual_quizzes
SET
    answered_question_ids = $2,
    correct_count = $3,
    elapsed_time_millis = $4,
    is_active = $5,
    updated_at = NOW()
WHERE id = $1
RETURNING 
    id, user_id, filter_node, sort_keys, collection_names, 
    question_ids, answered_question_ids, total_questions, correct_count, 
    elapsed_time_millis, preferred_mode, dummy_char_count, is_active, 
    created_at, updated_at;
