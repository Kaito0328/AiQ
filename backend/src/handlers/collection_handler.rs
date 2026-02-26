use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use uuid::Uuid;

use crate::{extractors::auth::OptionalClaims, state::AppState};
use crate::{models::user::User, utils::jwt::Claims};

// --- Collection Handlers ---
use crate::dtos::collection_dto::{CreateCollectionRequest, UpdateCollectionRequest};
use crate::models::collection::Collection;
use crate::services::collection_service::CollectionService;

pub async fn create_collection(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<CreateCollectionRequest>,
) -> Result<(StatusCode, Json<Collection>), StatusCode> {
    match CollectionService::create_collection(&state.db, claims.user_id(), payload).await {
        Ok(collection) => Ok((StatusCode::CREATED, Json(collection))),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
pub async fn get_collection(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims, // 🌟 ログインしていない人も見れるように Option にする
    Path(collection_id): Path<Uuid>,
) -> Result<Json<crate::dtos::collection_dto::CollectionResponse>, StatusCode> {
    let requester_id = claims.map(|c| c.user_id());
    match CollectionService::get_collection(&state.db, collection_id, requester_id).await {
        Ok(collection) => Ok(Json(collection)),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::NOT_FOUND), // 存在しない、または非公開
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_user_collections(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims,
    target_user: User,
) -> Result<Json<Vec<crate::dtos::collection_dto::CollectionResponse>>, StatusCode> {
    let requester_id = claims.map(|c| c.user_id());
    match CollectionService::get_user_collections(&state.db, target_user.id, requester_id).await {
        Ok(collections) => Ok(Json(collections)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn update_collection(
    State(state): State<AppState>,
    claims: Claims,
    Path(collection_id): Path<Uuid>,
    Json(payload): Json<UpdateCollectionRequest>,
) -> Result<Json<Collection>, StatusCode> {
    match CollectionService::update_collection(&state.db, collection_id, claims.user_id(), payload)
        .await
    {
        Ok(collection) => Ok(Json(collection)),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn delete_collection(
    State(state): State<AppState>,
    claims: Claims,
    Path(collection_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    match CollectionService::delete_collection(&state.db, collection_id, claims.user_id()).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) | Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn batch_collections(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<crate::dtos::collection_dto::BatchCollectionsRequest>,
) -> Result<Json<crate::dtos::batch_dto::BatchUpsertResponse<Collection>>, StatusCode> {
    match CollectionService::batch_collections(&state.db, claims.user_id(), payload).await {
        Ok((upserted, _deleted)) => Ok(Json(crate::dtos::batch_dto::BatchUpsertResponse {
            success_items: upserted,
            failed_create_items: Vec::new(),
            failed_update_items: Vec::new(),
        })),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

#[derive(serde::Deserialize)]
pub struct TimelineQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

pub async fn get_followee_collections(
    State(state): State<AppState>,
    claims: Claims,
    axum::extract::Query(query): axum::extract::Query<TimelineQuery>,
) -> Result<Json<Vec<crate::dtos::collection_dto::CollectionResponse>>, StatusCode> {
    let limit = query.limit.unwrap_or(20);
    let offset = query.offset.unwrap_or(0);

    match CollectionService::get_followee_collections(&state.db, claims.user_id(), limit, offset)
        .await
    {
        Ok(collections) => Ok(Json(collections)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_recent_collections(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims,
    axum::extract::Query(query): axum::extract::Query<TimelineQuery>,
) -> Result<Json<Vec<crate::dtos::collection_dto::CollectionResponse>>, StatusCode> {
    let limit = query.limit.unwrap_or(20);
    let offset = query.offset.unwrap_or(0);
    let requester_id = claims.map(|c| c.user_id());

    match CollectionService::get_recent_collections(&state.db, limit, offset, requester_id).await {
        Ok(collections) => Ok(Json(collections)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
