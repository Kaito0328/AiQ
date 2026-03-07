SELECT 
    c.id, c.user_id, c.name, c.description_text, c.is_open, c.default_mode, c.created_at, c.updated_at
FROM collections c
JOIN collection_set_collections csc ON c.id = csc.collection_id
WHERE csc.collection_set_id = $1
ORDER BY csc.display_order ASC;
