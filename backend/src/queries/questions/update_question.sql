UPDATE questions
SET
    question_text = $1,
    correct_answers = $2,
    answer_rubis = $3,
    distractors = $4,
    chip_answer = $5,
    is_selection_only = $6,
    description_text = $7,
    updated_at = NOW()
WHERE id = $8
RETURNING id, collection_id, question_text, correct_answers, answer_rubis, distractors, chip_answer, is_selection_only, description_text, created_at, updated_at;