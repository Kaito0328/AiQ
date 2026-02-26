use axum::{
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

use crate::{
    dtos::ranking_quiz_dto::{
        RankingQuizResultDto, StartRankingQuizRequest, StartRankingQuizResponse,
        SubmitRankingAllAnswersRequest, SubmitRankingAnswerRequest, SubmitRankingAnswerResponse,
    },
    error::AppError,
    services::ranking_quiz_service::RankingQuizService,
    state::AppState,
    utils::jwt::Claims,
};

#[axum::debug_handler]
pub async fn start_ranking_quiz(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<StartRankingQuizRequest>,
) -> Result<Json<StartRankingQuizResponse>, AppError> {
    let result = RankingQuizService::start_quiz(&state.db, claims.user_id(), payload).await?;
    Ok(Json(result))
}

#[axum::debug_handler]
pub async fn submit_ranking_answer(
    State(state): State<AppState>,
    claims: Claims,
    Path(quiz_id): Path<Uuid>,
    Json(payload): Json<SubmitRankingAnswerRequest>,
) -> Result<Json<SubmitRankingAnswerResponse>, AppError> {
    let result =
        RankingQuizService::submit_answer(&state.db, claims.user_id(), quiz_id, payload).await?;
    Ok(Json(result))
}

#[axum::debug_handler]
pub async fn submit_ranking_all_answers(
    State(state): State<AppState>,
    claims: Claims,
    Path(quiz_id): Path<Uuid>,
    Json(payload): Json<SubmitRankingAllAnswersRequest>,
) -> Result<Json<RankingQuizResultDto>, AppError> {
    let result =
        RankingQuizService::submit_all_answers(&state.db, claims.user_id(), quiz_id, payload)
            .await?;
    Ok(Json(result))
}

#[axum::debug_handler]
pub async fn get_leaderboard(
    State(state): State<AppState>,
    Path(collection_id): Path<Uuid>,
) -> Result<Json<crate::dtos::collection_dto::LeaderboardResponse>, AppError> {
    let result = RankingQuizService::get_leaderboard(&state.db, collection_id).await?;
    Ok(Json(result))
}
