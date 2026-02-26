INSERT INTO casual_quiz_answers (quiz_id, question_id, user_answer, is_correct)
VALUES ($1, $2, $3, $4)
RETURNING *;
