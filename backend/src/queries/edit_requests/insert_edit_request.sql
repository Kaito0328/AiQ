WITH inserted AS (
    INSERT INTO edit_requests (
        question_id, requester_id, question_text, correct_answers, answer_rubis, distractors, chip_answer, is_selection_only, description_text, reason_id,
        original_answer_rubis, original_distractors, original_chip_answer, original_is_selection_only
    )
    SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, q.answer_rubis, q.distractors, q.chip_answer, q.is_selection_only
    FROM questions q WHERE q.id = $1
    RETURNING *
)
SELECT i.id, i.question_id, i.requester_id, u.username as requester_name, i.question_text, i.correct_answers, i.answer_rubis, i.distractors, i.chip_answer, i.is_selection_only, i.description_text, i.reason_id, i.status, i.created_at,
       q.question_text as original_question_text, q.correct_answers as original_correct_answers, i.original_answer_rubis, i.original_distractors, i.original_chip_answer, i.original_is_selection_only, q.description_text as original_description_text,
       c.name as collection_name
FROM inserted i
JOIN users u ON i.requester_id = u.id
JOIN questions q ON i.question_id = q.id
JOIN collections c ON q.collection_id = c.id
