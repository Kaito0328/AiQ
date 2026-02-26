use crate::error::AppError;
use crate::utils::jwt::Claims;
use axum::{
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts},
};

// --- 🌟 共通関数: ヘッダーからトークンを取り出して検証する ---
fn extract_claims(parts: &Parts) -> Result<Option<Claims>, AppError> {
    // 1. ヘッダーから抽出を試みる
    let auth_header = parts
        .headers
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok());

    if let Some(header) = auth_header
        && let Some(token) = header.strip_prefix("Bearer ")
    {
        eprintln!("[DEBUG] Extracting claims from Authorization header");
        let claims = crate::utils::jwt::verify_token(token).map_err(|e| {
            eprintln!("[DEBUG] Token verification failed (header): {}", e);
            AppError::Unauthorized("Invalid or expired token".to_string())
        })?;
        return Ok(Some(claims));
    }

    // 2. クエリパラメータから抽出を試みる (WebSocket用など)
    if let Some(query) = parts.uri.query() {
        eprintln!("[DEBUG] Query string: {}", query);
        for param in query.split('&') {
            if let Some(token) = param.strip_prefix("token=") {
                eprintln!("[DEBUG] Token parameter found in query");
                let claims = crate::utils::jwt::verify_token(token).map_err(|e| {
                    eprintln!("[DEBUG] Token verification failed (query): {}", e);
                    AppError::Unauthorized("Invalid or expired token".to_string())
                })?;
                return Ok(Some(claims));
            }
        }
        eprintln!("[DEBUG] Token parameter NOT found in query");
    }

    // 3. そもそもトークンが無い場合 -> None として通す
    eprintln!("[DEBUG] No token found in header or query");
    Ok(None)
}

// --- 1. 必須の Claims 抽出器 (ログイン必須のAPI用) ---
impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // 共通関数を呼び出し、None だった場合は 401 エラーにして弾く
        match extract_claims(parts)? {
            Some(claims) => Ok(claims),
            None => Err(AppError::Unauthorized("Token is missing".to_string())),
        }
    }
}

// --- 2. 任意の OptionalClaims 抽出器 (未ログインでも見れるAPI用) ---
pub struct OptionalClaims(pub Option<Claims>);

impl<S> FromRequestParts<S> for OptionalClaims
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // 共通関数を呼び出し、結果をそのまま OptionalClaims で包んで返す
        let claims = extract_claims(parts)?;
        Ok(OptionalClaims(claims))
    }
}
