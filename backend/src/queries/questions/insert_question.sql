INSERT INTO questions (collection_id, question_text, correct_answers, answer_rubis, description_text)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, collection_id, question_text, correct_answers, answer_rubis, description_text, created_at, updated_at;