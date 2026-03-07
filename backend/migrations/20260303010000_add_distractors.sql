-- Add distractors column to questions table
ALTER TABLE questions ADD COLUMN distractors TEXT[] NOT NULL DEFAULT '{}';
