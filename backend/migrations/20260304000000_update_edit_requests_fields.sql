-- Migration: Add answer_rubis and distractors to edit_requests table
ALTER TABLE edit_requests ADD COLUMN answer_rubis TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE edit_requests ADD COLUMN distractors TEXT[] NOT NULL DEFAULT '{}';

-- Also add columns to store original values for comparison
ALTER TABLE edit_requests ADD COLUMN original_answer_rubis TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE edit_requests ADD COLUMN original_distractors TEXT[] NOT NULL DEFAULT '{}';
