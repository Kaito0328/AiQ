-- 1. お気に入り数更新用のトリガー関数
CREATE OR REPLACE FUNCTION update_collection_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO collection_stats (collection_id, favorite_count)
        VALUES (NEW.collection_id, 1)
        ON CONFLICT (collection_id) DO UPDATE
        SET favorite_count = collection_stats.favorite_count + 1,
            updated_at = NOW();
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE collection_stats
        SET favorite_count = GREATEST(0, favorite_count - 1),
            updated_at = NOW()
        WHERE collection_id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. トリガーの適用
DROP TRIGGER IF EXISTS trg_update_collection_favorite_count ON favorite_collections;
CREATE TRIGGER trg_update_collection_favorite_count
AFTER INSERT OR DELETE ON favorite_collections
FOR EACH ROW
EXECUTE FUNCTION update_collection_favorite_count();

-- 3. 既存のお気に入りデータを集計して同期
INSERT INTO collection_stats (collection_id, favorite_count)
SELECT collection_id, COUNT(*) as favorite_count
FROM favorite_collections
GROUP BY collection_id
ON CONFLICT (collection_id) DO UPDATE
SET favorite_count = EXCLUDED.favorite_count,
    updated_at = NOW();

-- 4. 統計情報に存在しないコレクションについても 0 で初期化（既にあるトリガーと重複するが念のため）
INSERT INTO collection_stats (collection_id, favorite_count)
SELECT id, 0
FROM collections
ON CONFLICT (collection_id) DO NOTHING;
