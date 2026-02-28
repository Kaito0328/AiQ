-- Migration: Create edit_requests table
CREATE TABLE edit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    correct_answers TEXT[] NOT NULL,
    description_text TEXT,
    reason_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_edit_requests_question_id ON edit_requests(question_id);
CREATE INDEX idx_edit_requests_requester_id ON edit_requests(requester_id);
CREATE INDEX idx_edit_requests_status ON edit_requests(status);
