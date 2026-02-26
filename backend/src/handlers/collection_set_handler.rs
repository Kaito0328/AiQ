use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use uuid::Uuid;

use crate::{
    dtos::collection_set_dto::{
        AddCollectionToSetRequest, CreateCollectionSetRequest, UpdateCollectionSetRequest,
    },
    extractors::auth::OptionalClaims,
    models::user::User,
    state::AppState,
};

use crate::models::collection::CollectionSet;
use crate::services::collection_set_service::CollectionSetService;
use crate::utils::jwt::Claims;

pub async fn create_set(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<CreateCollectionSetRequest>,
) -> Result<(StatusCode, Json<CollectionSet>), StatusCode> {
    match CollectionSetService::create_set(&state.db, claims.user_id(), payload).await {
        Ok(set) => Ok((StatusCode::CREATED, Json(set))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_set(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims, // 🌟 Option にする
    Path(set_id): Path<Uuid>,
) -> Result<Json<crate::dtos::collection_set_dto::CollectionSetResponse>, StatusCode> {
    let requester_id = claims.map(|c| c.user_id());
    match CollectionSetService::get_set(&state.db, set_id, requester_id).await {
        Ok(response) => Ok(Json(response)),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_user_sets(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims, // 🌟 Option にする
    target_user: User,
) -> Result<Json<Vec<CollectionSet>>, StatusCode> {
    let requester_id = claims.map(|c| c.user_id());
    match CollectionSetService::get_user_sets(&state.db, target_user.id, requester_id).await {
        Ok(sets) => Ok(Json(sets)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn update_set(
    State(state): State<AppState>,
    claims: Claims,
    Path(set_id): Path<Uuid>,
    Json(payload): Json<UpdateCollectionSetRequest>,
) -> Result<Json<CollectionSet>, StatusCode> {
    match CollectionSetService::update_set(&state.db, set_id, claims.user_id(), payload).await {
        Ok(set) => Ok(Json(set)),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn delete_set(
    State(state): State<AppState>,
    claims: Claims,
    Path(set_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    match CollectionSetService::delete_set(&state.db, set_id, claims.user_id()).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) | Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn add_collection_to_set(
    State(state): State<AppState>,
    claims: Claims,
    Path(set_id): Path<Uuid>,
    Json(payload): Json<AddCollectionToSetRequest>,
) -> Result<StatusCode, StatusCode> {
    match CollectionSetService::add_collection(&state.db, set_id, claims.user_id(), payload).await {
        Ok(_) => Ok(StatusCode::CREATED),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn remove_collection_from_set(
    State(state): State<AppState>,
    claims: Claims,
    Path((set_id, collection_id)): Path<(Uuid, Uuid)>,
) -> Result<StatusCode, StatusCode> {
    match CollectionSetService::remove_collection(
        &state.db,
        set_id,
        collection_id,
        claims.user_id(),
    )
    .await
    {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Ok(false) | Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
