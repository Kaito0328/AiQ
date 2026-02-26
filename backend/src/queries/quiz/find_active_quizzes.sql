SELECT * FROM casual_quizzes
WHERE user_id = $1 AND is_active = true
ORDER BY created_at DESC;
