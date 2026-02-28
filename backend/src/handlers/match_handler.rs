use crate::dtos::match_dto::CreateMatchRoomRequest;
use crate::error::AppError;
use crate::services::match_service::MatchService;
use crate::state::AppState;
use crate::utils::jwt::Claims;
use axum::{Json, Router, extract::State, routing::post};

use axum::routing::get;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/room", post(create_room))
        .route("/room", get(list_rooms))
}

pub async fn list_rooms(
    State(state): State<AppState>,
    _claims: Claims,
) -> Result<Json<Vec<crate::dtos::match_dto::MatchRoomListItem>>, AppError> {
    let result = MatchService::list_public_rooms(&state.match_state).await?;
    Ok(Json(result))
}

pub async fn create_room(
    State(state): State<AppState>,
    claims: Claims,
    Json(req): Json<CreateMatchRoomRequest>,
) -> Result<Json<crate::dtos::match_dto::CreateMatchRoomResponse>, AppError> {
    let result = MatchService::create_room(&state.db, &state.match_state, claims.sub, req).await?;
    Ok(Json(result))
}
