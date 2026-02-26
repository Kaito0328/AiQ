INSERT INTO questions (collection_id, question_text, correct_answer, description_text)
VALUES ($1, $2, $3, $4)
RETURNING id, collection_id, question_text, correct_answer, description_text, created_at, updated_at;