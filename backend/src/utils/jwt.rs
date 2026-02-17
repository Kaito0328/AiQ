use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use std::env;

// JWTに含めるペイロード（中身）の構造体
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // ユーザー名
    pub exp: usize,  // 有効期限
}

pub fn generate_token(username: &str) -> Result<String, String> {
    // .envからシークレットキーを取得（なければデフォルト値を使用）
    let secret = env::var("JWT_SECRET").unwrap_or_else(|_| "secret_key".to_string());
    
    // 有効期限を24時間後に設定
    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: username.to_owned(),
        exp: expiration,
    };

    // トークンを生成
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| e.to_string())
}