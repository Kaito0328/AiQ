INSERT INTO collection_stats (collection_id)
SELECT id FROM UNNEST($1::uuid[]) AS id
ON CONFLICT (collection_id) DO NOTHING
