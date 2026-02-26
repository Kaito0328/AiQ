use crate::{
    dtos::{
        auth_dto::{AuthRequest, AuthResponse},
        user_dto::{UserProfileResponse, UserSearchQuery},
    },
    error::{AppError, Result},
    services::user_service,
    state::AppState,
    utils::jwt::Claims,
};
use axum::{
    Json,
    extract::{Query, State},
};

use crate::dtos::user_dto::ChangePasswordRequest;
use serde_json::{Value, json};

// サインアップAPI
pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<AuthRequest>,
) -> Result<Json<AuthResponse>> {
    let password = payload
        .password
        .ok_or_else(|| AppError::InternalServerError("Password is required".to_string()))?;

    let user = user_service::register_user(&state.db, &payload.username, &password).await?;

    let token =
        crate::utils::jwt::generate_token(user.id).map_err(AppError::InternalServerError)?;

    Ok(Json(AuthResponse { token }))
}

// ログインAPI
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<AuthRequest>,
) -> Result<Json<AuthResponse>> {
    let password = payload
        .password
        .ok_or_else(|| AppError::InternalServerError("Password is required".to_string()))?;

    let user = user_service::authenticate(&state.db, &payload.username, &password).await?;

    let token =
        crate::utils::jwt::generate_token(user.id).map_err(AppError::InternalServerError)?;

    Ok(Json(AuthResponse { token }))
}

pub async fn get_me(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<Json<crate::models::user::User>> {
    let user = crate::repositories::user::find_by_id(&state.db, claims.user_id())
        .await?
        .ok_or(AppError::UserNotFound)?;

    Ok(Json(user))
}

use crate::extractors::auth::OptionalClaims;

// GET /api/users/:user_id
pub async fn get_profile(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims,
    target_user: crate::models::user::User, // 抽出器を使用するように変更
) -> Result<Json<UserProfileResponse>> {
    let current_user_id = claims.map(|c| c.user_id());
    let response = user_service::get_user_profile(
        &state.db,
        current_user_id, // 自分のID (未ログインも許容)
        target_user.id,  // 相手のID
    )
    .await?;

    Ok(Json(response))
}

pub async fn get_users(
    State(state): State<AppState>,
    claims: Claims,
    Query(params): Query<UserSearchQuery>,
) -> Result<Json<Vec<UserProfileResponse>>> {
    let users = user_service::search_users(&state.db, claims.user_id(), params).await?;

    Ok(Json(users))
}

// PUT /api/user/password
pub async fn change_password(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<ChangePasswordRequest>,
) -> Result<Json<Value>> {
    // 変更: username() から user_id() に修正
    user_service::change_password(&state.db, claims.user_id(), payload).await?;

    Ok(Json(json!({ "message": "Password changed successfully" })))
}

pub async fn update_profile(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<crate::dtos::user_dto::UpdateProfileRequest>,
) -> Result<Json<Value>> {
    // 変更: username() から user_id() に修正
    user_service::update_user_profile(&state.db, claims.user_id(), payload).await?;

    Ok(Json(json!({ "message": "Profile updated successfully" })))
}

// GET /api/users/official
pub async fn get_official_user(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims,
) -> Result<Json<UserProfileResponse>> {
    let official_user = crate::repositories::user::find_by_username(&state.db, "official_user")
        .await?
        .ok_or(AppError::UserNotFound)?;

    let current_user_id = claims.map(|c| c.user_id());
    let response = user_service::get_user_profile(
        &state.db,
        current_user_id,
        official_user.id,
    )
    .await?;

    Ok(Json(response))
}
