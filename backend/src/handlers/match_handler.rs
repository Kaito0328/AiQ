use crate::dtos::match_dto::CreateMatchRoomRequest;
use crate::error::AppError;
use crate::services::match_service::MatchService;
use crate::state::AppState;
use crate::utils::jwt::Claims;
use axum::{Json, Router, extract::State, routing::post};

pub fn routes() -> Router<AppState> {
    Router::new().route("/room", post(create_room))
    // WS endpoints will be added here soon
}

pub async fn create_room(
    State(state): State<AppState>,
    claims: Claims,
    Json(req): Json<CreateMatchRoomRequest>,
) -> Result<Json<crate::dtos::match_dto::CreateMatchRoomResponse>, AppError> {
    let result = MatchService::create_room(&state.db, &state.match_state, claims.sub, req).await?;
    Ok(Json(result))
}
