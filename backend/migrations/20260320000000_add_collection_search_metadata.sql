CREATE TABLE collection_search_metadata (
    collection_id UUID PRIMARY KEY REFERENCES collections(id) ON DELETE CASCADE,
    difficulty_level SMALLINT NOT NULL DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
    tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collection_search_metadata_difficulty
    ON collection_search_metadata (difficulty_level);

CREATE INDEX idx_collection_search_metadata_tags
    ON collection_search_metadata USING GIN (tags);
