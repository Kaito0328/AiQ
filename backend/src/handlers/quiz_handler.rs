use crate::{
    dtos::quiz_dto::{StartCasualQuizRequest, SubmitAnswerRequest, CasualQuizResponse, QuizStartResponse, QuizResumeResponse},
    error::AppError,
    utils::jwt::Claims,
    services::quiz_service::QuizService,
    repositories::{question::QuestionRepository, quiz::QuizRepository},
    state::AppState,
};
use axum::{
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

pub async fn start_casual_quiz(
    State(state): State<AppState>,
    claims: Claims,
    Json(req): Json<StartCasualQuizRequest>,
) -> Result<Json<QuizStartResponse>, AppError> {
    let quiz = QuizService::start_casual_quiz(
        &state.db,
        claims.user_id(),
        req,
    )
    .await?;

    let mut questions = Vec::new();
    for &q_id in &quiz.question_ids {
        if let Ok(q) = QuestionRepository::find_by_id(&state.db, q_id).await {
            questions.push(q);
        }
    }

    Ok(Json(QuizStartResponse {
        quiz: quiz.into(),
        questions,
    }))
}

pub async fn submit_answer(
    State(state): State<AppState>,
    claims: Claims,
    Path(quiz_id): Path<Uuid>,
    Json(req): Json<SubmitAnswerRequest>,
) -> Result<Json<CasualQuizResponse>, AppError> {
    let quiz = QuizService::submit_answer(
        &state.db,
        claims.user_id(),
        quiz_id,
        req.question_id,
        Some(req.user_answer),
        req.elapsed_millis,
    )
    .await?;

    Ok(Json(quiz.into()))
}

pub async fn get_resumes(
    State(state): State<AppState>,
    claims: Claims,
) -> Result<Json<Vec<CasualQuizResponse>>, AppError> {
    let quizzes = QuizService::get_resumes(&state.db, claims.user_id()).await?;
    let responses = quizzes.into_iter().map(Into::into).collect();
    Ok(Json(responses))
}

pub async fn resume_quiz(
    State(state): State<AppState>,
    claims: Claims,
    Path(quiz_id): Path<Uuid>,
) -> Result<Json<QuizResumeResponse>, AppError> {
    let quiz = QuizService::resume_quiz(&state.db, claims.user_id(), quiz_id).await?;
    
    let mut questions = Vec::new();
    for &q_id in &quiz.question_ids {
        if let Ok(q) = QuestionRepository::find_by_id(&state.db, q_id).await {
            questions.push(q);
        }
    }

    let answers = QuizRepository::find_answers_by_quiz_id(&state.db, quiz_id).await.unwrap_or_default();
    let answers_outputs = answers.into_iter().map(Into::into).collect();

    let response = QuizResumeResponse {
        quiz: quiz.into(),
        questions,
        answers: answers_outputs,
    };

    Ok(Json(response))
}
