SELECT c.*
FROM collections c
JOIN collection_set_collections csc ON c.id = csc.collection_id
WHERE csc.collection_set_id = $1
ORDER BY csc.display_order ASC;
