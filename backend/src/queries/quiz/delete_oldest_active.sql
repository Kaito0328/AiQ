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
RETURNING 
    id, user_id, filter_node, sort_keys, collection_names, 
    question_ids, answered_question_ids, total_questions, correct_count, 
    elapsed_time_millis, preferred_mode, dummy_char_count, is_active, 
    created_at, updated_at;
