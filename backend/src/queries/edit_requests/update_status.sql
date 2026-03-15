WITH updated AS (
    UPDATE edit_requests SET status = $1 WHERE id = $2 RETURNING *
)
SELECT i.id, i.question_id, i.requester_id, u.username as requester_name, i.question_text, i.correct_answers, i.answer_rubis, i.distractors, i.chip_answer, i.is_selection_only, i.description_text, i.reason_id, i.status, i.created_at,
       q.question_text as original_question_text, q.correct_answers as original_correct_answers, i.original_answer_rubis, i.original_distractors, i.original_chip_answer, i.original_is_selection_only, q.description_text as original_description_text,
       c.name as collection_name
FROM updated i
JOIN users u ON i.requester_id = u.id
JOIN questions q ON i.question_id = q.id
JOIN collections c ON q.collection_id = c.id
