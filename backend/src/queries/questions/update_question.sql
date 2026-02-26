UPDATE questions
SET question_text = $1, correct_answer = $2, description_text = $3, updated_at = NOW()
WHERE id = $4
RETURNING id, collection_id, question_text, correct_answer, description_text, created_at, updated_at;