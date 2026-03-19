-- 問題が追加・更新・削除された時に、所属するコレクションの updated_at を自動更新するトリガー
-- これにより、フロントエンドの If-Modified-Since を使った差分検知が正確に機能する

CREATE OR REPLACE FUNCTION update_collection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collections SET updated_at = NOW()
  WHERE id = COALESCE(NEW.collection_id, OLD.collection_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_question_updates_collection
AFTER INSERT OR UPDATE OR DELETE ON questions
FOR EACH ROW EXECUTE FUNCTION update_collection_updated_at();
