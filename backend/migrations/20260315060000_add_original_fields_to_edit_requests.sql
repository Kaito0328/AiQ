-- Migration: Add original fields to edit_requests
ALTER TABLE edit_requests ADD COLUMN original_chip_answer TEXT;
ALTER TABLE edit_requests ADD COLUMN original_is_selection_only BOOLEAN NOT NULL DEFAULT FALSE;
