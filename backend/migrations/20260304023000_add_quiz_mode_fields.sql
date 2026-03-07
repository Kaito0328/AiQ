-- Add mode fields to questions and collections
ALTER TABLE questions ADD COLUMN IF NOT EXISTS preferred_mode VARCHAR(20) NOT NULL DEFAULT 'default';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS recommended_mode VARCHAR(20) NOT NULL DEFAULT 'recall';

ALTER TABLE collections ADD COLUMN IF NOT EXISTS default_mode VARCHAR(20) NOT NULL DEFAULT 'omakase';
