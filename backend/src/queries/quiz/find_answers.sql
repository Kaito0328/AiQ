SELECT * FROM casual_quiz_answers
WHERE quiz_id = $1
ORDER BY created_at ASC;
