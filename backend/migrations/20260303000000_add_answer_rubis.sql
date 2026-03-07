-- Add answer_rubis column to questions table
ALTER TABLE questions ADD COLUMN answer_rubis TEXT[] NOT NULL DEFAULT '{}';
