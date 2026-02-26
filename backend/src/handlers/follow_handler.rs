// src/handlers/follow_handler.rs
use crate::{
    error::Result, models::user::User, services::follow_service, state::AppState,
    utils::jwt::Claims,
};
use axum::{Json, extract::State};
use serde_json::{Value, json};

// POST /api/users/:username/follow
pub async fn follow_user(
    State(state): State<AppState>,
    claims: Claims,
    target_user: User,
) -> Result<Json<Value>> {
    // claims.sub にはログイン中の自分の名前が入っています
    follow_service::follow(&state.db, claims.user_id(), target_user.id).await?;

    // 成功した場合はシンプルなJSONを返します
    Ok(Json(json!({
        "message": format!("Successfully followed {}", target_user.username)
    })))
}

// DELETE /api/users/{username}/follow
pub async fn unfollow_user(
    State(state): State<AppState>,
    claims: Claims,
    target_user: User,
) -> Result<Json<Value>> {
    // claims.sub にはログイン中の自分の名前が入っています
    follow_service::unfollow(&state.db, claims.user_id(), target_user.id).await?;

    Ok(Json(json!({
        "message": format!("Successfully unfollowed {}", target_user.username)
    })))
}

use crate::extractors::auth::OptionalClaims;

// GET /api/users/{username}/followers
pub async fn get_followers(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims,
    target_user: User,
) -> Result<Json<Vec<crate::dtos::user_dto::UserProfileResponse>>> {
    let user_id = claims.map(|c| c.user_id());
    let followers = follow_service::get_followers(&state.db, user_id, target_user.id).await?;
    Ok(Json(followers))
}

// GET /api/users/{username}/followees
pub async fn get_followees(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims,
    target_user: User,
) -> Result<Json<Vec<crate::dtos::user_dto::UserProfileResponse>>> {
    let user_id = claims.map(|c| c.user_id());
    let followees = follow_service::get_followees(&state.db, user_id, target_user.id).await?;
    Ok(Json(followees))
}
