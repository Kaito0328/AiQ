use crate::dtos::match_ws_dto::{PlayerScoreDto, WsClientMessage, WsServerMessage};
use crate::state::AppState;
use crate::state::match_state::PlayerState;
use crate::utils::jwt::Claims;
use axum::{
    extract::{
        Path, Query, State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::IntoResponse,
};
use futures::{sink::SinkExt, stream::StreamExt};
use uuid::Uuid;

#[derive(serde::Deserialize)]
pub struct WsQuery {
    pub token: Option<String>,
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Path(room_id): Path<Uuid>,
    Query(query): Query<WsQuery>,
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| async move {
        handle_socket(socket, room_id, state, query.token, headers).await;
    })
}

async fn handle_socket(
    socket: WebSocket,
    room_id: Uuid,
    state: AppState,
    query_token: Option<String>,
    headers: axum::http::HeaderMap,
) {
    let mut user_id = Uuid::new_v4();
    let mut username = format!("Guest_{}", &user_id.to_string()[..4]);

    // Try to verify token from query or headers
    let token = query_token.or_else(|| {
        headers.get("Authorization")
            .and_then(|h| h.to_str().ok())
            .and_then(|s| s.strip_prefix("Bearer "))
            .map(|s| s.to_string())
    });

    if let Some(token) = token {
        if let Ok(claims) = crate::utils::jwt::verify_token(&token) {
            if let Ok(Some(record)) = sqlx::query!("SELECT username FROM users WHERE id = $1", claims.sub)
                .fetch_optional(&state.db)
                .await 
            {
                user_id = claims.sub;
                username = record.username;
            }
        }
    }

    let (mut sender, mut receiver) = socket.split();

    // Send identity information back to the client
    let join_msg = WsServerMessage::Joined { user_id, username: username.clone() };
    let _ = sender.send(Message::Text(serde_json::to_string(&join_msg).unwrap().into())).await;

    // We need to fetch the room
    let rx = {
        let mut rooms = state.match_state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            // Join the room if not already in
            if !room.players.contains_key(&user_id) {
                room.players.insert(
                    user_id,
                    PlayerState {
                        user_id,
                        username: username.clone(),
                        score: 0,
                        correct_answers: 0,
                    },
                );

                // Notify OTHERS via broadcast
                let players: Vec<PlayerScoreDto> = room
                    .players
                    .values()
                    .map(|p| PlayerScoreDto {
                        user_id: p.user_id,
                        username: p.username.clone(),
                        score: p.score,
                    })
                    .collect();

                let msg = WsServerMessage::RoomStateUpdate {
                    players,
                    host_id: room.host_id,
                    status: room.status.clone(),
                };
                let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
            }

            // ALWAYS send current state to THIS user immediately
            let players: Vec<PlayerScoreDto> = room
                .players
                .values()
                .map(|p| PlayerScoreDto {
                    user_id: p.user_id,
                    username: p.username.clone(),
                    score: p.score,
                })
                .collect();

            let msg = WsServerMessage::RoomStateUpdate {
                players,
                host_id: room.host_id,
                status: room.status.clone(),
            };
            let _ = sender
                .send(Message::Text(serde_json::to_string(&msg).unwrap().into()))
                .await;

            room.tx.subscribe()
        } else {
            // Room not found
            let err = WsServerMessage::Error {
                message: "Room not found".to_string(),
            };
            let _ = sender
                .send(Message::Text(serde_json::to_string(&err).unwrap().into()))
                .await;
            return;
        }
    };

    // Create a task to forward broadcast messages to this websocket
    let mut rx_task = tokio::spawn(async move {
        let mut rx = rx;
        while let Ok(msg) = rx.recv().await {
            if sender.send(Message::Text(msg.into())).await.is_err() {
                break;
            }
        }
    });

    // Process incoming websocket messages
    let app_state = state.clone();
    let mut tx_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            eprintln!("[DEBUG] Received WS message: {}", text);
            match serde_json::from_str::<WsClientMessage>(&text) {
                Ok(client_msg) => {
                    eprintln!("[DEBUG] Parsed client message: {:?}", client_msg);
                    crate::services::match_ws_service::MatchWsService::handle_ws_message(
                        &app_state,
                        room_id,
                        user_id,
                        client_msg,
                        ).await;
                }
                Err(e) => {
                    eprintln!("[DEBUG] Failed to parse client message: {} | error: {}", text, e);
                }
            }
        }
    });

    tokio::select! {
        _ = (&mut rx_task) => tx_task.abort(),
        _ = (&mut tx_task) => rx_task.abort(),
    }
}
