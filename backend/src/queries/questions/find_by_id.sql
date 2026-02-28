SELECT id, collection_id, question_text, correct_answers, description_text, created_at, updated_at
FROM questions
WHERE id = $1;