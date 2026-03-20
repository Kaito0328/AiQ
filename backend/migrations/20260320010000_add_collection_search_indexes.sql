CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_collections_name_trgm
    ON collections USING GIN (name gin_trgm_ops);

CREATE INDEX idx_collections_description_text_trgm
    ON collections USING GIN (description_text gin_trgm_ops);

CREATE INDEX idx_collections_open_created_at
    ON collections (is_open, created_at DESC);

CREATE INDEX idx_collection_stats_popular_sort
    ON collection_stats (favorite_count DESC, play_count DESC, updated_at DESC);

CREATE INDEX idx_collection_search_metadata_updated_at
    ON collection_search_metadata (updated_at DESC);
