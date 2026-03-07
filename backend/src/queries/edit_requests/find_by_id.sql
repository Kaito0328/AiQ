SELECT er.id, er.question_id, er.requester_id, u.username as requester_name, er.question_text, er.correct_answers, er.answer_rubis, er.distractors, er.description_text, er.reason_id, er.status, er.created_at,
       q.question_text as original_question_text, q.correct_answers as original_correct_answers, er.original_answer_rubis, er.original_distractors, q.description_text as original_description_text,
       c.name as collection_name
FROM edit_requests er
JOIN questions q ON er.question_id = q.id
JOIN collections c ON q.collection_id = c.id
JOIN users u ON er.requester_id = u.id
WHERE er.id = $1
