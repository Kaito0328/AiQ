use axum::{
    extract::{Path, State, WebSocketUpgrade, ws::{Message, WebSocket}},
    response::IntoResponse,
};
use uuid::Uuid;
use futures::{sink::SinkExt, stream::StreamExt};
use std::sync::Arc;

use crate::{
    dtos::{ai_dto::{GenerateQuestionsRequest, WsMessage}, question_dto::{BatchQuestionsRequest, UpsertQuestionItem}},
    utils::jwt::Claims,
    services::{ai_service::AiService, question_service::QuestionService},
    state::AppState,
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
                let _ = socket.send(Message::Text(serde_json::to_string(&WsMessage {
                    status: "error".into(),
                    message: "Invalid JSON format for generation request".into(),
                    data: None,
                }).unwrap().into())).await;
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
    let _ = socket.send(Message::Text(serde_json::to_string(&WsMessage {
        status: "processing".into(),
        message: format!("Generating {} questions with AI...", count),
        data: None,
    }).unwrap().into())).await;

    // Generate questions
    match AiService::generate_questions(&req.prompt, count).await {
        Ok(questions) => {
            // Save to DB
            let _ = socket.send(Message::Text(serde_json::to_string(&WsMessage {
                status: "saving".into(),
                message: "Saving generated questions to database...".into(),
                data: None,
            }).unwrap().into())).await;

            let upsert_items: Vec<UpsertQuestionItem> = questions.iter().map(|q| UpsertQuestionItem {
                id: None,
                question_text: Some(q.question_text.clone()),
                correct_answer: Some(q.correct_answer.clone()),
                description_text: q.description_text.clone(),
            }).collect();

            let batch_req = BatchQuestionsRequest {
                upsert_items,
                delete_ids: vec![],
            };

            match QuestionService::batch_questions(&pool, collection_id, user_id, batch_req).await {
                Ok(_) => {
                    let _ = socket.send(Message::Text(serde_json::to_string(&WsMessage {
                        status: "completed".into(),
                        message: "Successfully generated and saved questions!".into(),
                        data: Some(questions),
                    }).unwrap().into())).await;
                },
                Err(e) => {
                    let _ = socket.send(Message::Text(serde_json::to_string(&WsMessage {
                        status: "error".into(),
                        message: format!("Failed to save questions: {}", e),
                        data: None,
                    }).unwrap().into())).await;
                }
            }
        },
        Err(e) => {
            let _ = socket.send(Message::Text(serde_json::to_string(&WsMessage {
                status: "error".into(),
                message: format!("AI Generation failed: {}", e),
                data: None,
            }).unwrap().into())).await;
        }
    }

    let _ = socket.close().await;
}
