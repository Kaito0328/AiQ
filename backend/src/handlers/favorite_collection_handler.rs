use crate::dtos::collection_dto::CollectionResponse;
use crate::error::AppError;

use crate::services::favorite_collection_service::FavoriteCollectionService;
use crate::state::AppState;
use axum::{
    Json,
    extract::{Path, State},
};
use std::sync::Arc;
use uuid::Uuid;

pub async fn add_favorite(
    State(state): State<AppState>,
    claims: crate::utils::jwt::Claims,
    Path(collection_id): Path<Uuid>,
) -> Result<(), AppError> {
    let service = FavoriteCollectionService::new(Arc::new(state.db.clone()));
    service.add_favorite(claims.user_id(), collection_id).await
}

pub async fn remove_favorite(
    State(state): State<AppState>,
    claims: crate::utils::jwt::Claims,
    Path(collection_id): Path<Uuid>,
) -> Result<(), AppError> {
    let service = FavoriteCollectionService::new(Arc::new(state.db.clone()));
    service.remove_favorite(claims.user_id(), collection_id).await
}

pub async fn list_favorites(
    State(state): State<AppState>,
    Path(user_id): Path<Uuid>,
) -> Result<Json<Vec<CollectionResponse>>, AppError> {
    let service = FavoriteCollectionService::new(Arc::new(state.db.clone()));
    let collections = service.list_favorites(user_id).await?;
    Ok(Json(collections))
}
