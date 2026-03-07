-- Allow user_id to be NULL for guest quizzes
ALTER TABLE casual_quizzes
    ALTER COLUMN user_id DROP NOT NULL;

-- The foreign key constraint name is usually casual_quizzes_user_id_fkey
ALTER TABLE casual_quizzes
    DROP CONSTRAINT IF EXISTS casual_quizzes_user_id_fkey;
