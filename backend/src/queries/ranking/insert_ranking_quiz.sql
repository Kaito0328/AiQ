INSERT INTO ranking_quizzes (user_id, collection_id, question_ids, total_questions)
VALUES ($1, $2, $3, $4)
RETURNING id, user_id, collection_id, question_ids, answered_question_ids, total_questions, correct_count, started_at, completed_at, is_active, created_at, updated_at
