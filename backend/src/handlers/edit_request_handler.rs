use axum::{
    extract::{Path, State},
    Json,
    response::IntoResponse,
};
use uuid::Uuid;
use crate::error::AppError;
use crate::dtos::edit_request_dto::{CreateEditRequest, UpdateEditRequestStatus};
use crate::services::edit_request_service::EditRequestService;
use crate::utils::jwt::Claims;
use crate::state::AppState;

pub async fn create_edit_request(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<CreateEditRequest>,
) -> Result<impl IntoResponse, AppError> {
    let response = EditRequestService::create_request(&state.db, claims.user_id(), payload).await?;
    Ok(Json(response))
}

pub async fn list_requests_by_collection(
    State(state): State<AppState>,
    _claims: Claims,
    Path(collection_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let response = EditRequestService::list_by_collection(&state.db, collection_id).await?;
    Ok(Json(response))
}

pub async fn list_my_requests(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<impl IntoResponse, AppError> {
    let response = EditRequestService::list_by_owner(&state.db, claims.user_id()).await?;
    Ok(Json(response))
}

pub async fn update_request_status(
    State(state): State<AppState>,
    _claims: Claims,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateEditRequestStatus>,
) -> Result<impl IntoResponse, AppError> {
    let response = EditRequestService::update_status(&state.db, id, payload.status).await?;
    Ok(Json(response))
}
