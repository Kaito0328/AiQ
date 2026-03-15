SELECT id, collection_id, question_text, correct_answers, answer_rubis, distractors, chip_answer, is_selection_only, description_text, created_at, updated_at
FROM questions
WHERE collection_id = $1
ORDER BY created_at ASC, id ASC;