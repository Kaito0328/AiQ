INSERT INTO casual_quizzes (
    user_id, filter_types, sort_keys, collection_names,
    question_ids, answered_question_ids, total_questions, correct_count, elapsed_time_millis, is_active
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;
