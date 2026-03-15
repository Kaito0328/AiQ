-- Add chip_answer and is_selection_only to questions table
-- Migrate preferred_mode/recommended_mode to is_selection_only

ALTER TABLE questions ADD COLUMN chip_answer TEXT;
ALTER TABLE questions ADD COLUMN is_selection_only BOOLEAN NOT NULL DEFAULT FALSE;

-- Migrate existing data
UPDATE questions 
SET is_selection_only = TRUE 
WHERE preferred_mode = 'fourChoice' OR recommended_mode = 'fourChoice' OR recommended_mode = 'selection';

-- Remove old columns
ALTER TABLE questions DROP COLUMN preferred_mode;
ALTER TABLE questions DROP COLUMN recommended_mode;
