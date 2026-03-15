INSERT INTO questions (id, collection_id, question_text, correct_answers, answer_rubis, distractors, chip_answer, is_selection_only, description_text, created_at, updated_at)
VALUES ($1::uuid, $2::uuid, $3::text, $4::text[], $5::text[], $6::text[], $7::text, $8::boolean, $9::text, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    question_text = EXCLUDED.question_text,
    correct_answers = EXCLUDED.correct_answers,
    answer_rubis = EXCLUDED.answer_rubis,
    distractors = EXCLUDED.distractors,
    chip_answer = EXCLUDED.chip_answer,
    is_selection_only = EXCLUDED.is_selection_only,
    description_text = EXCLUDED.description_text,
    updated_at = NOW()
RETURNING id, collection_id, question_text, correct_answers as "correct_answers: Vec<String>", answer_rubis as "answer_rubis: Vec<String>", distractors as "distractors: Vec<String>", chip_answer, is_selection_only, description_text, created_at, updated_at
