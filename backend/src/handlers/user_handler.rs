use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use crate::{
    dtos::auth_dto::{AuthRequest, AuthResponse},
    services::user_service,
    state::AppState,
};

// サインアップAPI (/api/auth/register)
pub async fn register(
    // アプリケーションの状態(DBプール)を受け取る
    State(state): State<AppState>,
    // リクエストボディのJSONをパースして受け取る
    Json(payload): Json<AuthRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    // パスワードが必須なので存在チェックを行います
    let password = payload.password.ok_or((
        StatusCode::BAD_REQUEST,
        "Password is required".to_string(),
    ))?;

    // Service層を呼び出してユーザーを登録
    let user = user_service::register_user(&state.db, &payload.username, &password)
        .await
        .map_err(|e| {
            if e == "DUPLICATE_USER" {
                (StatusCode::CONFLICT, e)
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, e)
            }
        })?;

    // JWTトークンの生成
    let token = crate::utils::jwt::generate_token(&user.username)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    // 成功時は JSONでトークンを返す
    Ok(Json(AuthResponse { token }))
}

// ログインAPI (/api/auth/login)
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<AuthRequest>,
) -> Result<Json<AuthResponse>, (StatusCode, String)> {
    let password = payload.password.ok_or((
        StatusCode::BAD_REQUEST,
        "Password is required".to_string(),
    ))?;

    // Service層を呼び出して認証
    let user = user_service::authenticate(&state.db, &payload.username, &password)
        .await
        .map_err(|e| {
            if e == "NOT_FOUND_USER" || e == "INVALID_PASSWORD" {
                (StatusCode::UNAUTHORIZED, "Invalid credentials".to_string())
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, e)
            }
        })?;

    let token = crate::utils::jwt::generate_token(&user.username)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e))?;

    Ok(Json(AuthResponse { token }))
}