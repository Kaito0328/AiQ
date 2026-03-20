use axum::{
    extract::{
        Path, State, WebSocketUpgrade,
        ws::{Message, WebSocket},
    },
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    dtos::{
        ai_dto::{GenerateQuestionsRequest, WsMessage},
        question_dto::{BatchQuestionsRequest, UpsertQuestionItem},
    },
    services::{ai_service::AiService, question_service::QuestionService},
    state::AppState,
    utils::jwt::Claims,
};

pub async fn generate_ai_questions_ws(
    State(state): State<AppState>,
    claims: Claims,
    Path(collection_id): Path<Uuid>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    let pool = Arc::new(state.db.clone());
    let user_id = claims.user_id();

    ws.on_upgrade(move |socket| handle_ws(socket, pool, user_id, collection_id))
}

async fn handle_ws(
    mut socket: WebSocket,
    pool: Arc<sqlx::PgPool>,
    user_id: Uuid,
    collection_id: Uuid,
) {
    let mut request_payload: Option<GenerateQuestionsRequest> = None;

    // Loop waiting for the first message which should be the prompt payload
    while let Some(msg) = socket.next().await {
        if let Ok(Message::Text(text)) = msg {
            if let Ok(req) = serde_json::from_str::<GenerateQuestionsRequest>(&text) {
                request_payload = Some(req);
                break;
            } else {
                let _ = socket
                    .send(Message::Text(
                        serde_json::to_string(&WsMessage {
                            status: "error".into(),
                            message: "Invalid JSON format for generation request".into(),
                            data: None,
                        })
                        .unwrap()
                        .into(),
                    ))
                    .await;
                return;
            }
        }
    }

    let req = match request_payload {
        Some(r) => r,
        None => return,
    };

    let count = req.count.unwrap_or(5);

    // Send processing status
    let _ = socket
        .send(Message::Text(
            serde_json::to_string(&WsMessage {
                status: "processing".into(),
                message: format!("Generating {} questions with AI...", count),
                data: None,
            })
            .unwrap()
            .into(),
        ))
        .await;

    // Generate questions
    match AiService::generate_questions(
        &pool,
        user_id,
        &req.prompt,
        count,
        req.collection_difficulty,
        req.pdf_data.as_deref(),
        req.pdf_page_count,
        req.question_format.as_deref(),
        req.answer_format.as_deref(),
        req.example_question.as_deref(),
        req.example_answer.as_deref(),
        req.explanation_language.as_deref(),
    )
    .await
    {
        Ok(questions) => {
            // Save to DB
            let _ = socket
                .send(Message::Text(
                    serde_json::to_string(&WsMessage {
                        status: "saving".into(),
                        message: "Saving generated questions to database...".into(),
                        data: None,
                    })
                    .unwrap()
                    .into(),
                ))
                .await;

            let upsert_items: Vec<UpsertQuestionItem> = questions
                .iter()
                .map(|q| UpsertQuestionItem {
                    id: None,
                    question_text: Some(q.question_text.clone()),
                    correct_answers: Some(q.correct_answers.clone()),
                    answer_rubis: q.answer_rubis.clone(),
                    distractors: Some(q.distractors.clone()),
                    chip_answer: q.chip_answer.clone(),
                    is_selection_only: q.is_selection_only,
                    description_text: q.description_text.clone(),
                })
                .collect();

            let batch_req = BatchQuestionsRequest {
                upsert_items,
                delete_ids: vec![],
            };

            match QuestionService::batch_questions(&pool, collection_id, user_id, batch_req).await {
                Ok(_) => {
                    let _ = socket
                        .send(Message::Text(
                            serde_json::to_string(&WsMessage {
                                status: "completed".into(),
                                message: "Successfully generated and saved questions!".into(),
                                data: Some(questions),
                            })
                            .unwrap()
                            .into(),
                        ))
                        .await;
                }
                Err(e) => {
                    let _ = socket
                        .send(Message::Text(
                            serde_json::to_string(&WsMessage {
                                status: "error".into(),
                                message: format!("Failed to save questions: {}", e),
                                data: None,
                            })
                            .unwrap()
                            .into(),
                        ))
                        .await;
                }
            }
        }
        Err(e) => {
            let _ = socket
                .send(Message::Text(
                    serde_json::to_string(&WsMessage {
                        status: "error".into(),
                        message: format!("AI Generation failed: {}", e),
                        data: None,
                    })
                    .unwrap()
                    .into(),
                ))
                .await;
        }
    }

    let _ = socket.close().await;
}

pub async fn get_ai_usage(
    State(state): State<crate::AppState>,
    claims: crate::utils::jwt::Claims,
) -> Result<axum::Json<crate::dtos::ai_dto::AiUsageResponse>, crate::error::AppError> {
    let usage = crate::services::ai_limit_service::AiLimitService::get_usage(
        &state.db,
        claims.user_id(),
    )
    .await?;
    Ok(axum::Json(usage))
}

pub async fn complete_ai_questions(
    State(state): axum::extract::State<crate::AppState>,
    claims: Claims,
    axum::Json(req): axum::Json<crate::dtos::ai_dto::CompleteQuestionsRequest>,
) -> Result<axum::Json<Vec<crate::dtos::ai_dto::GeneratedQuestion>>, crate::error::AppError> {
    let questions = crate::services::ai_service::AiService::complete_questions(
        &state.db,
        claims.user_id(),
        req.items,
        req.complete_description.unwrap_or(true),
        req.question_format,
        req.answer_format,
        req.explanation_language,
        req.collection_difficulty,
    )
    .await?;
    Ok(axum::Json(questions))
}
