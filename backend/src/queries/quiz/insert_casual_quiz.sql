INSERT INTO casual_quizzes (
    user_id, filter_node, sort_keys, collection_names,
    question_ids, answered_question_ids, total_questions, correct_count, elapsed_time_millis,
    preferred_mode, dummy_char_count, is_active
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
) RETURNING 
    id, user_id, filter_node, sort_keys, collection_names, 
    question_ids, answered_question_ids, total_questions, correct_count, 
    elapsed_time_millis, preferred_mode, dummy_char_count, is_active, 
    created_at, updated_at;
