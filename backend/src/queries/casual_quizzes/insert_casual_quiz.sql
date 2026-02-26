INSERT INTO casual_quizzes 
(user_id, filter_types, sort_keys, collection_names, question_ids, total_questions)
 VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *