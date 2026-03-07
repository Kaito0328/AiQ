SELECT id, user_id, collection_id, question_ids, answered_question_ids, total_questions, correct_count, started_at, completed_at, is_active, created_at, updated_at
FROM ranking_quizzes
WHERE id = $1 AND is_active = true
