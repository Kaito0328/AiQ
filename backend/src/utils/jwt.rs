use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exp: Option<usize>,
}

impl Claims {
    // 🌟 変更: Uuid を受け取るように変更
    pub fn for_user(user_id: Uuid, expiration_hours: Option<u64>) -> Self {
        let exp = expiration_hours.map(|hours| {
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs() as usize
                + (hours * 60 * 60) as usize
        });

        Self { sub: user_id, exp }
    }

    pub fn user_id(&self) -> Uuid {
        self.sub
    }
}

// 🌟 トークンの生成: user_id を受け取るように変更
pub fn generate_token(user_id: Uuid) -> Result<String, String> {
    let exp_hours_str = std::env::var("JWT_EXP_HOURS").unwrap_or_else(|_| "24".to_string());
    let exp_hours: u64 = exp_hours_str.parse().unwrap_or(24);

    let expiration = if exp_hours == 0 {
        None
    } else {
        Some(exp_hours)
    };

    let claims = Claims::for_user(user_id, expiration);
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "secret_key".to_string());

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| e.to_string())
}

// トークンの検証 (変更なし)
pub fn verify_token(token: &str) -> Result<Claims, String> {
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "secret_key".to_string());
    let mut validation = Validation::default();
    validation.required_spec_claims.remove("exp");

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .map_err(|e| e.to_string())?;

    Ok(token_data.claims)
}
