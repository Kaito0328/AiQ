UPDATE questions
SET
    question_text = $1,
    correct_answers = $2,
    answer_rubis = $3,
    description_text = $4,
    updated_at = NOW()
WHERE id = $5
RETURNING id, collection_id, question_text, correct_answers, answer_rubis, description_text, created_at, updated_at;