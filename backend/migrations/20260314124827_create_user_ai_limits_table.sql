-- AI生成制限（ユニット制）用のテーブル
CREATE TABLE user_ai_limits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    units_used REAL NOT NULL DEFAULT 0,
    last_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_user_ai_limits_last_reset ON user_ai_limits(last_reset_at);
