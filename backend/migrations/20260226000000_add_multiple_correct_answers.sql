-- Migration: Add multiple correct answers support
-- 1. Add new column correct_answers
ALTER TABLE questions ADD COLUMN correct_answers TEXT[] NOT NULL DEFAULT '{}';

-- 2. Migrate existing data
UPDATE questions SET correct_answers = ARRAY[correct_answer];

-- 3. Drop old column
ALTER TABLE questions DROP COLUMN correct_answer;

-- 4. Ensure casual_quiz_answers also supports multiple (optional, but good for history)
-- However, for answers given by user, we usually Record ONE answer. 
-- The check logic happens in services.
