use std::time::{SystemTime, UNIX_EPOCH};
use crate::dtos::match_dto::MatchQuestionDto;
use crate::dtos::match_ws_dto::{PlayerScoreDto, WsClientMessage, WsServerMessage};
use crate::state::match_state::{RoomStatus, SharedMatchState};
use uuid::Uuid;

pub struct MatchWsService;

fn get_now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

impl MatchWsService {
    pub async fn handle_ws_message(
        state: &crate::state::AppState,
        room_id: Uuid,
        user_id: Uuid,
        msg: WsClientMessage,
    ) {
        eprintln!("[DEBUG] MatchWsService handling message: {:?} from user: {}", msg, user_id);
        match msg {
            WsClientMessage::JoinRoom { join_token: _, .. } => {
                // Already handled join implicitly on connect, but we might validate token here
            }
            WsClientMessage::StartMatch => {
                Self::start_match(&state.match_state, room_id, user_id).await;
            }
            WsClientMessage::Buzz => {
                Self::handle_buzz(&state.match_state, room_id, user_id).await;
            }
            WsClientMessage::SubmitAnswer { answer } => {
                Self::handle_answer(&state.match_state, room_id, user_id, answer).await;
            }
            WsClientMessage::UpdateConfig { max_buzzes } => {
                Self::handle_update_config(&state.match_state, room_id, user_id, max_buzzes).await;
            }
            WsClientMessage::BackToLobby => {
                Self::handle_back_to_lobby(&state.match_state, room_id, user_id).await;
            }
            WsClientMessage::ResetMatch { collection_ids, filter_types, sort_keys, total_questions } => {
                Self::handle_reset_match(state, room_id, user_id, collection_ids, filter_types, sort_keys, total_questions).await;
            }
        }
    }

    async fn start_match(state: &SharedMatchState, room_id: Uuid, user_id: Uuid) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            // Only host can start
            if room.host_id != user_id {
                return;
            }

            if room.status != RoomStatus::Waiting {
                return;
            }

            if room.questions.is_empty() {
                let msg = WsServerMessage::Error {
                    message: "問題が選択されていません。コレクションを選択してリセットしてください。".to_string(),
                };
                let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
                return;
            }

            room.status = RoomStatus::Playing;
            room.current_question_index = 0;
            room.round_sequence = 0; // Reset sequence

            let questions_dto: Vec<MatchQuestionDto> = room
                .questions
                .iter()
                .map(|q| MatchQuestionDto {
                    id: q.id,
                    question_text: q.question_text.clone(),
                    description_text: q.description_text.clone(),
                })
                .collect();

            let total_questions = room.questions.len();
            let msg = WsServerMessage::MatchStarted {
                questions: questions_dto,
                max_buzzes: room.max_buzzes_per_round,
                total_questions,
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());

            // Briefly delay before starting the first round to let front end render
            let _tx = room.tx.clone();
            let state = state.clone();
            tokio::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
                Self::start_round(&state, room_id, 0).await;
            });
        }
    }

    async fn start_round(state: &SharedMatchState, room_id: Uuid, index: usize) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.status != RoomStatus::Playing {
                return;
            }
            room.current_question_index = index;
            room.buzzed_user_ids.clear();
            room.round_sequence += 1; // Increment for new round
            let current_sequence = room.round_sequence;

            let expires_at_ms = get_now_ms() + 20000; // 20 seconds to buzz
            let msg = WsServerMessage::RoundStarted {
                question_index: index,
                expires_at_ms,
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());

            // Spawn timeout for no one buzzing
            let state = state.clone();
            tokio::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_secs(20)).await;
                Self::handle_round_timeout(&state, room_id, index, current_sequence).await;
            });
        }
    }

    async fn handle_round_timeout(state: &SharedMatchState, room_id: Uuid, index: usize, sequence: i32) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            // Check sequence and status
            if room.status == RoomStatus::Playing 
                && room.current_question_index == index 
                && room.round_sequence == sequence
                && room.active_buzzer.is_none()
            {
                eprintln!("[DEBUG] Round timeout for room: {} | seq: {}", room_id, sequence);
                Self::end_round_internal(room, state.clone());
            }
        }
    }

    async fn handle_buzz(state: &SharedMatchState, room_id: Uuid, user_id: Uuid) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.status != RoomStatus::Playing {
                return;
            }

            // ONLY buzz if nobody is currently answering
            if room.active_buzzer.is_some() {
                return;
            }

            // Check if player hasn't already buzzed (already failed or already buzzed)
            if room.buzzed_user_ids.contains(&user_id) {
                return;
            }

            // Check capacity lock
            if room.buzzed_user_ids.len() < room.max_buzzes_per_round {
                room.buzzed_user_ids.push(user_id);
                room.active_buzzer = Some(user_id);
                room.round_sequence += 1; // SUSPEND current question timer
                let current_sequence = room.round_sequence;

                let expires_at_ms = get_now_ms() + 10000; // 10 seconds to answer
                let msg = WsServerMessage::PlayerBuzzed {
                    user_id,
                    expires_at_ms,
                };
                let _ = room.tx.send(serde_json::to_string(&msg).unwrap());

                // Spawn timeout for not answering
                let state = state.clone();
                let current_index = room.current_question_index;
                tokio::spawn(async move {
                    tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
                    Self::handle_answer_timeout(&state, room_id, current_index, current_sequence, user_id).await;
                });
            }
        }
    }

    async fn handle_answer_timeout(state: &SharedMatchState, room_id: Uuid, index: usize, sequence: i32, user_id: Uuid) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
             if room.status == RoomStatus::Playing 
                && room.current_question_index == index 
                && room.round_sequence == sequence
                && room.active_buzzer == Some(user_id)
            {
                drop(rooms);
                // Trigger incorrect answer
                Self::handle_answer(state, room_id, user_id, "".to_string()).await;
            }
        }
    }

    async fn handle_answer(state: &SharedMatchState, room_id: Uuid, user_id: Uuid, answer: String) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            eprintln!("[DEBUG] Handling answer from user: {} | room: {} | status: {:?} | buzzed_users: {:?}", user_id, room_id, room.status, room.buzzed_user_ids);
            if room.status != RoomStatus::Playing {
                eprintln!("[DEBUG] Room is not in Playing status");
                return;
            }

            // Verify they actually buzzed
            if !room.buzzed_user_ids.contains(&user_id) {
                eprintln!("[DEBUG] User did not buzz");
                return;
            }

            let current_q = &room.questions[room.current_question_index];
            let is_correct = answer
                .trim()
                .eq_ignore_ascii_case(current_q.correct_answer.trim());
            
            eprintln!("[DEBUG] Answer: {} | Correct: {} | Result: {}", answer, current_q.correct_answer, is_correct);

            if let Some(player) = room.players.get_mut(&user_id) {
                if is_correct {
                    player.score += 1000;
                    player.correct_answers += 1;
                }

                let msg = WsServerMessage::AnswerResult {
                    user_id,
                    is_correct,
                    new_score: player.score,
                };
                let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
            }

            room.active_buzzer = None;

            // Decide if we should end the round
            let is_max_buzzes = room.buzzed_user_ids.len() >= room.max_buzzes_per_round;
            let should_end_round = is_correct || is_max_buzzes;

            if should_end_round {
                Self::end_round_internal(room, state.clone());
            } else {
                // If incorrect but more buzzes available, resume round with 10s extension
                let next_index = room.current_question_index;
                drop(rooms);
                Self::resume_round(&state, room_id, next_index).await;
            }
        }
    }

    async fn resume_round(state: &SharedMatchState, room_id: Uuid, index: usize) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.status != RoomStatus::Playing || room.current_question_index != index {
                return;
            }
            // Keep buzzed_user_ids to know who already failed
            room.round_sequence += 1;
            let current_sequence = room.round_sequence;
            
            let expires_at_ms = get_now_ms() + 10000; // 10s extension for others to buzz
            let msg = WsServerMessage::RoundStarted {
                question_index: index,
                expires_at_ms,
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());

            let state = state.clone();
            tokio::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;
                Self::handle_round_timeout(&state, room_id, index, current_sequence).await;
            });
        }
    }

    fn end_round_internal(room: &mut crate::state::match_state::RoomState, state: SharedMatchState) {
        room.active_buzzer = None;
        room.round_sequence += 1;
        let current_q = &room.questions[room.current_question_index];
        let correct_answer = current_q.correct_answer.clone();
        let scores: Vec<PlayerScoreDto> = room
            .players
            .values()
            .map(|p| PlayerScoreDto {
                user_id: p.user_id,
                username: p.username.clone(),
                score: p.score,
            })
            .collect();

        let round_result_msg = WsServerMessage::RoundResult {
            correct_answer,
            scores: scores.clone(),
        };
        let _ = room
            .tx
            .send(serde_json::to_string(&round_result_msg).unwrap());

        // Schedule next round or end match
        room.current_question_index += 1;
        let is_match_over = room.current_question_index >= room.questions.len();
        let tx = room.tx.clone();
        let next_index = room.current_question_index;

        if is_match_over {
            room.status = RoomStatus::Finished;
        }

        let room_id = room.room_id;
        tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
            if is_match_over {
                let msg = WsServerMessage::MatchResult {
                    final_scores: scores,
                };
                let _ = tx.send(serde_json::to_string(&msg).unwrap());
            } else {
                Self::start_round(&state, room_id, next_index).await;
            }
        });
    }

    async fn handle_update_config(state: &SharedMatchState, room_id: Uuid, user_id: Uuid, max_buzzes: usize) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.host_id != user_id { return; }
            room.max_buzzes_per_round = max_buzzes;
            let msg = WsServerMessage::RoomConfigUpdated { max_buzzes };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
        }
    }

    async fn handle_back_to_lobby(state: &SharedMatchState, room_id: Uuid, user_id: Uuid) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.host_id != user_id { return; }
            room.status = RoomStatus::Waiting;
            room.current_question_index = 0;
            room.buzzed_user_ids.clear();
            room.active_buzzer = None;
            for player in room.players.values_mut() {
                player.score = 0;
                player.correct_answers = 0;
            }
            let players: Vec<PlayerScoreDto> = room.players.values().map(|p| PlayerScoreDto {
                user_id: p.user_id,
                username: p.username.clone(),
                score: p.score,
            }).collect();
            let msg = WsServerMessage::RoomStateUpdate {
                players,
                host_id: room.host_id,
                status: room.status.clone(),
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
        }
    }

    async fn handle_reset_match(
        state: &crate::state::AppState,
        room_id: Uuid,
        user_id: Uuid,
        collection_ids: Vec<Uuid>,
        filter_types: Vec<String>,
        sort_keys: Vec<String>,
        total_questions: usize
    ) {
        use crate::repositories::question::QuestionRepository;
        use crate::state::match_state::MatchQuestion;
        use rand::seq::SliceRandom;
        use rand::thread_rng;

        // Fetch new questions
        let mut all_questions = Vec::new();
        for cid in &collection_ids {
            let mut qs = QuestionRepository::find_by_collection_id(&state.db, *cid)
                .await
                .unwrap_or_default();
            all_questions.append(&mut qs);
        }

        if all_questions.is_empty() { 
             eprintln!("[DEBUG] Reset failed: no questions found");
             return; 
        }

        {
            let mut rng = thread_rng();
            if sort_keys.contains(&"RANDOM".to_string()) || sort_keys.is_empty() {
                all_questions.shuffle(&mut rng);
            } else if sort_keys.contains(&"ID".to_string()) {
                all_questions.sort_by_key(|q| q.id);
            }
        }

        let selected: Vec<MatchQuestion> = all_questions
            .into_iter()
            .take(total_questions)
            .map(|q| MatchQuestion {
                id: q.id,
                question_text: q.question_text,
                description_text: q.description_text,
                correct_answer: q.correct_answer,
            })
            .collect();

        let mut rooms = state.match_state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.host_id != user_id { return; }
            room.questions = selected;
            room.status = RoomStatus::Waiting; 
            room.current_question_index = 0;
            room.buzzed_user_ids.clear();
            room.active_buzzer = None;
            for player in room.players.values_mut() {
                player.score = 0;
                player.correct_answers = 0;
            }
            
            let players: Vec<PlayerScoreDto> = room.players.values().map(|p| PlayerScoreDto {
                user_id: p.user_id,
                username: p.username.clone(),
                score: p.score,
            }).collect();
            let msg = WsServerMessage::RoomStateUpdate {
                players,
                host_id: room.host_id,
                status: room.status.clone(),
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
        }
    }
}
