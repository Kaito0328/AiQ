-- Add preferred_mode and dummy_char_count to casual_quizzes
ALTER TABLE casual_quizzes ADD COLUMN preferred_mode VARCHAR(20) NOT NULL DEFAULT 'text';
ALTER TABLE casual_quizzes ADD COLUMN dummy_char_count INT NOT NULL DEFAULT 6;
