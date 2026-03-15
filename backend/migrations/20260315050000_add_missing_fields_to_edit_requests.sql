-- Migration: Add missing fields to edit_requests
ALTER TABLE edit_requests ADD COLUMN chip_answer TEXT;
ALTER TABLE edit_requests ADD COLUMN is_selection_only BOOLEAN NOT NULL DEFAULT FALSE;
