use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use uuid::Uuid;

use crate::{
    dtos::question_dto::{CreateQuestionRequest, UpdateQuestionRequest},
    state::AppState,
};
use crate::{extractors::auth::OptionalClaims, services::question_service::QuestionService};
use crate::{models::question::Question, utils::jwt::Claims};
pub async fn create_question(
    State(state): State<AppState>,
    claims: Claims,
    Path(collection_id): Path<Uuid>,
    Json(payload): Json<CreateQuestionRequest>,
) -> Result<(StatusCode, Json<Question>), StatusCode> {
    match QuestionService::create_question(&state.db, collection_id, claims.user_id(), payload)
        .await
    {
        Ok(question) => Ok((StatusCode::CREATED, Json(question))),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn get_collection_questions(
    State(state): State<AppState>,
    OptionalClaims(claims): OptionalClaims, // 🌟 Option にする
    Path(collection_id): Path<Uuid>,
) -> Result<Json<Vec<Question>>, StatusCode> {
    let requester_id = claims.map(|c| c.user_id());
    match QuestionService::get_collection_questions(&state.db, collection_id, requester_id).await {
        Ok(questions) => Ok(Json(questions)),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::NOT_FOUND), // 親コレクションが非公開の場合は NotFound
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn update_question(
    State(state): State<AppState>,
    claims: Claims,
    Path(question_id): Path<Uuid>,
    Json(payload): Json<UpdateQuestionRequest>,
) -> Result<Json<Question>, StatusCode> {
    match QuestionService::update_question(&state.db, question_id, claims.user_id(), payload).await
    {
        Ok(question) => Ok(Json(question)),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn delete_question(
    State(state): State<AppState>,
    claims: Claims,
    Path(question_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    match QuestionService::delete_question(&state.db, question_id, claims.user_id()).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Ok(false) | Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

pub async fn batch_questions(
    State(state): State<AppState>,
    claims: Claims,
    Path(collection_id): Path<Uuid>,
    Json(payload): Json<crate::dtos::question_dto::BatchQuestionsRequest>,
) -> Result<Json<crate::dtos::batch_dto::BatchUpsertResponse<Question>>, StatusCode> {
    match QuestionService::batch_questions(&state.db, collection_id, claims.user_id(), payload).await {
        Ok((upserted, _deleted)) => Ok(Json(crate::dtos::batch_dto::BatchUpsertResponse {
            success_items: upserted,
            failed_create_items: Vec::new(),
            failed_update_items: Vec::new(),
        })),
        Err(sqlx::Error::RowNotFound) => Err(StatusCode::FORBIDDEN),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
