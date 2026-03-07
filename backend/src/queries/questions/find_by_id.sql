SELECT id, collection_id, question_text, correct_answers, answer_rubis, description_text, created_at, updated_at
FROM questions
WHERE id = $1;