use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use uuid::Uuid;

use crate::{extractors::auth::OptionalClaims, state::AppState};
use crate::{models::user::User, utils::jwt::Claims};

// --- Collection Handlers ---
use crate::dtos::collection_dto::{
    CreateCollectionRequest, UpsertCollectionSearchMetadataRequest, UpdateCollectionRequest,
};
use crate::models::collection::Collection;
use crate::services::collection_service::CollectionService;
use crate::services::csv_service::CsvService;
use crate::services::question_service::QuestionService;
use axum::extract::Multipart;
use axum::response::IntoResponse;

pub async fn upload_csv(
    State(state): State<AppState>,
    claims: Claims,
    Path(collection_id): Path<Uuid>,
    mut multipart: Multipart,
) -> Result<StatusCode, StatusCode> {
    let mut csv_data: Option<axum::body::Bytes> = None;

    while let Ok(Some(field)) = multipart.next_field().await {
        let field_name: Option<&str> = field.name();
        if field_name == Some("file") {
            let bytes_res = field.bytes().await;
            let bytes: axum::body::Bytes = bytes_res.map_err(|e| {
                tracing::error!("Multipart error: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;
            csv_data = Some(bytes);
            break;
        }
    }

    let csv_data = csv_data.ok_or(StatusCode::BAD_REQUEST)?;
    let upsert_items = crate::services::csv_service::CsvService::parse_csv(csv_data.as_ref())
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    let batch_req = crate::dtos::question_dto::BatchQuestionsRequest {
        upsert_items,
        delete_ids: vec![],
    };

    crate::services::question_service::QuestionService::batch_questions(
        &state.db,
        collection_id,
        claims.user_id(),
        batch_req,
    )
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}

pub async fn export_csv(
    State(state): State<AppState>,
    claims: Claims,
    Path(collection_id): Path<Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
    // Check ownership
    let collection =
        CollectionService::get_collection(&state.db, collection_id, Some(claims.user_id()))
            .await
            .map_err(|_| StatusCode::FORBIDDEN)?;

    if collection.user_id != claims.user_id() {
        return Err(StatusCode::FORBIDDEN);
    }

    let questions: Vec<crate::models::question::Question> =
        QuestionService::get_collection_questions(&state.db, collection_id, Some(claims.user_id()))
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let csv_string =
        CsvService::generate_csv(&questions).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut headers = axum::http::HeaderMap::new();
    headers.insert(
        axum::http::header::CONTENT_TYPE,
        axum::http::header::HeaderValue::from_static("text/csv"),
    );
    headers.insert(
        axum::http::header::CONTENT_DISPOSITION,
        axum::http::header::HeaderValue::from_str(&format!(
            "attachment; filename=\"{}.csv\"",
            collection.name
        ))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?,
    );

    Ok((headers, csv_string))
}

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
    headers: axum::http::HeaderMap,
) -> Result<impl IntoResponse, StatusCode> {
    let requester_id = claims.map(|c| c.user_id());
    match CollectionService::get_collection(&state.db, collection_id, requester_id).await {
        Ok(collection) => {
            // If-Modified-Since ヘッダーがあれば、差分検知
            if let Some(ims) = headers.get(axum::http::header::IF_MODIFIED_SINCE) {
                if let Ok(ims_str) = ims.to_str() {
                    if let Ok(ims_time) = chrono::DateTime::parse_from_rfc2822(ims_str) {
                        if collection.updated_at <= ims_time {
                            return Ok(StatusCode::NOT_MODIFIED.into_response());
                        }
                    }
                }
            }

            // Last-Modified ヘッダーを添付してレスポンス
            let last_modified = collection.updated_at.to_rfc2822();
            let mut response_headers = axum::http::HeaderMap::new();
            if let Ok(val) = axum::http::header::HeaderValue::from_str(&last_modified) {
                response_headers.insert(axum::http::header::LAST_MODIFIED, val);
            }
            Ok((response_headers, Json(collection)).into_response())
        },
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
        Err(e) => {
            tracing::error!("Batch Collections error: {:?}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

#[derive(serde::Deserialize)]
pub struct TimelineQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionSearchQuery {
    pub q: Option<String>,
    pub tags: Option<String>,
    pub difficulty_level: Option<i16>,
    pub difficulty_mode: Option<String>,
    pub sort: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PopularTagsQuery {
    pub q: Option<String>,
    pub limit: Option<i64>,
}

pub async fn get_followee_collections(
    State(state): State<AppState>,
    claims: Claims,
    Query(query): Query<TimelineQuery>,
) -> Result<Json<Vec<crate::dtos::collection_dto::CollectionResponse>>, StatusCode> {
    let limit = query
        .limit
        .unwrap_or_else(|| crate::config::get().collection.timeline_pagination_default);
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
    Query(query): Query<TimelineQuery>,
) -> Result<Json<Vec<crate::dtos::collection_dto::CollectionResponse>>, StatusCode> {
    let limit = query
        .limit
        .unwrap_or_else(|| crate::config::get().collection.timeline_pagination_default);
    let offset = query.offset.unwrap_or(0);
    let requester_id = claims.map(|c| c.user_id());

    match CollectionService::get_recent_collections(&state.db, limit, offset, requester_id).await {
        Ok(collections) => Ok(Json(collections)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn search_collections(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims,
    Query(query): Query<CollectionSearchQuery>,
) -> Result<Json<Vec<crate::dtos::collection_dto::CollectionSearchResponse>>, StatusCode> {
    let requester_id = claims.map(|c| c.user_id());
    let limit = query
        .limit
        .unwrap_or_else(|| crate::config::get().collection.timeline_pagination_default)
        .clamp(1, 100);
    let offset = query.offset.unwrap_or(0).max(0);
    let sort = query.sort.unwrap_or_else(|| "new".to_string());
    let tags = query
        .tags
        .unwrap_or_default()
        .split(',')
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
        .collect::<Vec<String>>();

    let clamped_level = query.difficulty_level.map(|v| v.clamp(1, 5));
    let difficulty_mode = query.difficulty_mode.unwrap_or_else(|| "exact".to_string());
    let (difficulty_min, difficulty_max) = match (clamped_level, difficulty_mode.as_str()) {
        (Some(level), "atLeast") => (Some(level), None),
        (Some(level), "atMost") => (None, Some(level)),
        (Some(level), _) => (Some(level), Some(level)),
        (None, _) => (None, None),
    };

    match CollectionService::search_collections(
        &state.db,
        query.q,
        tags,
        difficulty_min,
        difficulty_max,
        &sort,
        limit,
        offset,
        requester_id,
    )
    .await
    {
        Ok(collections) => Ok(Json(collections)),
        Err(err) => {
            tracing::error!("search_collections failed: {:?}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_popular_tags(
    State(state): State<AppState>,
    Query(query): Query<PopularTagsQuery>,
) -> Result<Json<Vec<crate::dtos::collection_dto::PopularTagResponse>>, StatusCode> {
    let limit = query.limit.unwrap_or(20).clamp(1, 30);

    match CollectionService::get_popular_tags(&state.db, limit, query.q).await {
        Ok(tags) => Ok(Json(tags)),
        Err(err) => {
            tracing::error!("get_popular_tags failed: {:?}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn upsert_collection_search_metadata(
    State(state): State<AppState>,
    claims: Claims,
    Path(collection_id): Path<Uuid>,
    Json(payload): Json<UpsertCollectionSearchMetadataRequest>,
) -> Result<StatusCode, StatusCode> {
    match CollectionService::upsert_search_metadata(&state.db, collection_id, claims.user_id(), payload)
        .await
    {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) => Err(StatusCode::FORBIDDEN),
        Err(err) => {
            tracing::error!("upsert_collection_search_metadata failed: {:?}", err);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
