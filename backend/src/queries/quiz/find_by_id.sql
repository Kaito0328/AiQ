SELECT 
    id, user_id, filter_node, sort_keys, collection_names, 
    question_ids, answered_question_ids, total_questions, correct_count, 
    elapsed_time_millis, preferred_mode, dummy_char_count, is_active, 
    created_at, updated_at
FROM casual_quizzes
WHERE id = $1;
