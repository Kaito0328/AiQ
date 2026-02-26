-- 1. トリガー関数の作成
CREATE OR REPLACE FUNCTION update_collection_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO collection_stats (collection_id, question_count)
        VALUES (NEW.collection_id, 1)
        ON CONFLICT (collection_id) DO UPDATE
        SET question_count = collection_stats.question_count + 1,
            updated_at = NOW();
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE collection_stats
        SET question_count = GREATEST(0, question_count - 1),
            updated_at = NOW()
        WHERE collection_id = OLD.collection_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. トリガーの適用
DROP TRIGGER IF EXISTS trg_update_collection_question_count ON questions;
CREATE TRIGGER trg_update_collection_question_count
AFTER INSERT OR DELETE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_collection_question_count();

-- 3. 既存データの統計情報を同期 (既存の collection_stats を最新の状態に更新)
INSERT INTO collection_stats (collection_id, question_count)
SELECT collection_id, COUNT(*) as question_count
FROM questions
GROUP BY collection_id
ON CONFLICT (collection_id) DO UPDATE
SET question_count = EXCLUDED.question_count,
    updated_at = NOW();

-- 4. 統計情報に存在しないコレクションについても 0 で初期化しておく
INSERT INTO collection_stats (collection_id, question_count)
SELECT id, 0
FROM collections
ON CONFLICT (collection_id) DO NOTHING;
