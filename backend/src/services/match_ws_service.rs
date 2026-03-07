use tracing::{debug, info};
use crate::dtos::match_dto::MatchQuestionDto;
use crate::dtos::match_ws_dto::{PlayerScoreDto, WsClientMessage, WsServerMessage};
use crate::state::match_state::{RoomStatus, SharedMatchState};
use rand::seq::SliceRandom;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

pub struct MatchWsService;

fn get_now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

impl MatchWsService {
    pub fn spawn_cleanup_task(state: SharedMatchState) {
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
            loop {
                interval.tick().await;
                let now = get_now_ms();

                let mut rooms = state.write().await;
                let mut to_remove = Vec::new();

                for (id, room) in rooms.iter() {
                    if let Some(empty_since) = room.empty_since {
                        if now - empty_since > 60000 {
                            // 60 seconds
                            to_remove.push(*id);
                        }
                    }
                }

                for id in to_remove {
                    rooms.remove(&id);
                    debug!("Cleaned up abandoned room: {}", id);
                }
            }
        });
    }

    pub async fn handle_ws_message(
        state: &crate::state::AppState,
        room_id: Uuid,
        user_id: Uuid,
        msg: WsClientMessage,
    ) {
        debug!(
            "MatchWsService handling message: {:?} from user: {}",
            msg, user_id
        );
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
            WsClientMessage::SubmitPartialAnswer { answer } => {
                Self::handle_partial_answer(&state.match_state, room_id, user_id, answer).await;
            }
            WsClientMessage::UpdateConfig { max_buzzes } => {
                Self::handle_update_config(&state.match_state, room_id, user_id, max_buzzes).await;
            }
            WsClientMessage::BackToLobby => {
                Self::handle_back_to_lobby(&state.match_state, room_id, user_id).await;
            }
            WsClientMessage::ResetMatch {
                collection_ids,
                filter_node,
                sorts,
                total_questions,
                preferred_mode,
                dummy_char_count,
            } => {
                Self::handle_reset_match(
                    state,
                    room_id,
                    user_id,
                    collection_ids,
                    filter_node,
                    sorts,
                    total_questions,
                    preferred_mode,
                    dummy_char_count,
                )
                .await;
            }
            WsClientMessage::UpdateVisibility { visibility } => {
                Self::handle_update_visibility(&state.match_state, room_id, user_id, visibility)
                    .await;
            }
            WsClientMessage::UpdateMatchConfig { config } => {
                Self::handle_update_match_config(&state.match_state, room_id, user_id, config)
                    .await;
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

            let can_start = match room.status {
                RoomStatus::Waiting => true,
                RoomStatus::Finished => true,
                _ => false,
            };

            if !can_start {
                return;
            }

            if room.status == RoomStatus::Finished {
                // Reset for replay
                room.current_question_index = 0;
                room.round_sequence = 0;
                room.buzzed_user_ids.clear();
                room.buzzer_queue.clear();
                room.submitted_user_ids.clear();
                room.active_buzzers.clear();
                
                // Shuffle questions for fresh experience
                let mut rng = rand::thread_rng();
                room.questions.shuffle(&mut rng);

                // Reset scores
                for player in room.players.values_mut() {
                    player.score = 0;
                    player.correct_answers = 0;
                }
            }

            if room.questions.is_empty() {
                let msg = WsServerMessage::Error {
                    message:
                        "問題が選択されていません。コレクションを選択してリセットしてください。"
                            .to_string(),
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
                .map(|q| MatchQuestionDto::from(q.clone()))
                .collect();

            let total_questions = room.questions.len();
            let msg = WsServerMessage::MatchStarted {
                questions: questions_dto,
                max_buzzes: room.max_buzzes_per_round,
                total_questions,
                preferred_mode: room.preferred_mode.clone(),
                dummy_char_count: room.dummy_char_count,
                config: room.config.clone(),
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
            room.buzzer_queue.clear();
            room.submitted_user_ids.clear();
            room.round_sequence += 1; // Increment for new round
            let current_sequence = room.round_sequence;

            let duration_ms = crate::config::get().battle.default_timer_seconds * 1000;
            let expires_at_ms = get_now_ms() + duration_ms;
            let msg = WsServerMessage::RoundStarted {
                question_index: index,
                expires_at_ms,
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());

            // Spawn timeout for no one buzzing
            let state = state.clone();
            tokio::spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_secs(
                    crate::config::get().battle.default_timer_seconds,
                ))
                .await;
                Self::handle_round_timeout(&state, room_id, index, current_sequence).await;
            });
        }
    }

    async fn handle_round_timeout(
        state: &SharedMatchState,
        room_id: Uuid,
        index: usize,
        sequence: i32,
    ) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            // Check sequence and status
            if room.status == RoomStatus::Playing
                && room.current_question_index == index
                && room.round_sequence == sequence
                && room.active_buzzers.is_empty()
            {
                debug!(
                    "Round timeout for room: {} | seq: {}",
                    room_id, sequence
                );
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

            // Check if player hasn't already buzzed (already failed or already buzzed)
            if room.buzzed_user_ids.contains(&user_id) {
                return;
            }

            // Check capacity lock
            if room.buzzed_user_ids.len() < room.max_buzzes_per_round {
                room.buzzed_user_ids.push(user_id);
                room.buzzer_queue.push(user_id);

                // Add to active buzzers immediately (Concurrent Answering)
                let duration_s = match room.preferred_mode.as_str() {
                    "fourChoice" => room.config.choice_timer_s,
                    "chips" => room.config.chips_char_timer_s,
                    _ => room.config.text_timer_s,
                };
                let expires_at_ms = get_now_ms() + duration_s * 1000;
                room.active_buzzers.insert(user_id, expires_at_ms);

                let msg = WsServerMessage::PlayerBuzzed {
                    user_id,
                    buzzed_user_ids: room.buzzed_user_ids.clone(),
                    submitted_user_ids: room.submitted_user_ids.clone(),
                    buzzer_queue: room.buzzer_queue.clone(),
                    active_buzzers: room.active_buzzers.clone(),
                };
                let _ = room.tx.send(serde_json::to_string(&msg).unwrap());

                // Individual timeout for this person
                let state_clone = state.clone();
                let current_index = room.current_question_index;
                let current_sequence = room.round_sequence;
                tokio::spawn(async move {
                    loop {
                        let now = get_now_ms();
                        let (wait_ms, should_timeout) = {
                            let rooms = state_clone.read().await;
                            if let Some(r) = rooms.get(&room_id) {
                                if r.status != RoomStatus::Playing
                                    || r.current_question_index != current_index
                                    || r.round_sequence != current_sequence
                                    || r.submitted_user_ids.contains(&user_id)
                                {
                                    break;
                                }

                                if let Some(&expires) = r.active_buzzers.get(&user_id) {
                                    if now >= expires {
                                        (0, true)
                                    } else {
                                        (expires - now, false)
                                    }
                                } else {
                                    break; // Should not happen if not submitted
                                }
                            } else {
                                break;
                            }
                        };

                        if wait_ms > 0 {
                            tokio::time::sleep(tokio::time::Duration::from_millis(wait_ms as u64))
                                .await;
                        } else if should_timeout {
                            Self::handle_answer_timeout(
                                &state_clone,
                                room_id,
                                current_index,
                                current_sequence,
                                user_id,
                            )
                            .await;
                            break;
                        }
                    }
                });
            }
        }
    }

    async fn handle_answer_timeout(
        state: &SharedMatchState,
        room_id: Uuid,
        index: usize,
        sequence: i32,
        user_id: Uuid,
    ) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            let now = get_now_ms();
            let is_expired = room.active_buzzers.get(&user_id).map_or(true, |&exp| now >= exp);

            if room.status == RoomStatus::Playing
                && room.current_question_index == index
                && room.round_sequence == sequence
                && room.buzzed_user_ids.contains(&user_id)
                && !room.submitted_user_ids.contains(&user_id)
                && is_expired
            {
                let current_q = &room.questions[index];
                let has_answers = !current_q.correct_answers.is_empty()
                    && current_q
                        .correct_answers
                        .iter()
                        .any(|a| !a.trim().is_empty());
                let timeout_answer = if has_answers {
                    "__TIMEOUT__".to_string()
                } else {
                    "".to_string()
                };
                drop(rooms);
                Self::handle_answer(state, room_id, user_id, timeout_answer).await;
            }
        }
    }

    async fn handle_partial_answer(
        state: &SharedMatchState,
        room_id: Uuid,
        user_id: Uuid,
        answer: String,
    ) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.status != RoomStatus::Playing {
                return;
            }

            // Chips mode: Per-character validation
            if room.preferred_mode == "chips" {
                let current_q = &room.questions[room.current_question_index];
                let trimmed_ans = answer.replace(' ', "").to_lowercase();

                // Is this answer still a valid prefix?
                let is_valid_prefix = current_q
                    .correct_answers
                    .iter()
                    .any(|c| c.replace(' ', "").to_lowercase().starts_with(&trimmed_ans))
                    || current_q
                        .answer_rubis
                        .iter()
                        .any(|r| r.replace(' ', "").to_lowercase().starts_with(&trimmed_ans));

                if !is_valid_prefix {
                    // Instant fail for chips mode
                    drop(rooms);
                    Self::handle_answer(state, room_id, user_id, answer).await;
                    return;
                }

                // Correct chip! Reset timer
                let expires_at_ms = get_now_ms() + room.config.chips_char_timer_s * 1000;
                room.active_buzzers.insert(user_id, expires_at_ms);
            }

            // Sync answer (For spectators)
            let msg = WsServerMessage::PartialAnswerUpdate {
                user_id,
                answer: answer.clone(),
                active_buzzers: room.active_buzzers.clone(),
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
        }
    }

    async fn handle_answer(state: &SharedMatchState, room_id: Uuid, user_id: Uuid, answer: String) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.status != RoomStatus::Playing {
                return;
            }

            if !room.buzzed_user_ids.contains(&user_id)
                || room.submitted_user_ids.contains(&user_id)
            {
                return;
            }

            room.submitted_user_ids.push(user_id);
            room.active_buzzers.remove(&user_id);

            let current_q = &room.questions[room.current_question_index];
            let trimmed_ans = answer.replace(' ', "").to_lowercase();
            let is_correct = current_q
                .correct_answers
                .iter()
                .any(|correct| trimmed_ans == correct.replace(' ', "").to_lowercase())
                || current_q
                    .answer_rubis
                    .iter()
                    .any(|rubi| trimmed_ans == rubi.replace(' ', "").to_lowercase());

            let is_first_buzzer = room.buzzed_user_ids.first() == Some(&user_id);
            let win_score = room.config.win_score;

            let mut new_score = 0i64;
            if let Some(player) = room.players.get_mut(&user_id) {
                if is_correct {
                    let bonus = if is_first_buzzer {
                        room.config.speed_bonus_max
                    } else {
                        0
                    };
                    player.score += room.config.base_score + bonus;
                    player.correct_answers += 1;
                } else {
                    let extra = if is_first_buzzer {
                        room.config.first_wrong_penalty
                    } else {
                        0
                    };
                    player.score -= room.config.penalty + extra;
                    if player.score < 0 {
                        player.score = 0;
                    } // floor at 0 — scores can't go negative
                }
                new_score = player.score;

                let msg = WsServerMessage::AnswerResult {
                    user_id,
                    is_correct,
                    new_score: player.score,
                    submitted_user_ids: room.submitted_user_ids.clone(),
                };
                let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
            }

            // Check win condition
            if is_correct {
                if let Some(threshold) = win_score {
                    if new_score >= threshold {
                        Self::end_round_internal(room, state.clone());
                        return;
                    }
                }
            }

            // Round ends when capacity is reached AND all who buzzed have submitted
            let is_limit_reached = room.buzzed_user_ids.len() >= room.max_buzzes_per_round;
            let all_submitted = room.submitted_user_ids.len() >= room.buzzed_user_ids.len();
            
            if is_limit_reached && all_submitted {
                Self::end_round_internal(room, state.clone());
            }

        }
    }

    fn end_round_internal(
        room: &mut crate::state::match_state::RoomState,
        state: SharedMatchState,
    ) {
        room.active_buzzers.clear();
        room.round_sequence += 1;
        let current_q = &room.questions[room.current_question_index];
        let correct_answer = current_q.correct_answers.join(" / ");
        let scores: Vec<PlayerScoreDto> = room
            .players
            .values()
            .map(|p| PlayerScoreDto {
                user_id: p.user_id,
                username: p.username.clone(),
                score: p.score,
                icon_url: p.icon_url.clone(),
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
        let delay_s = room.config.post_round_delay_seconds;
        tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_secs(delay_s)).await;
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

    async fn handle_update_config(
        state: &SharedMatchState,
        room_id: Uuid,
        user_id: Uuid,
        max_buzzes: usize,
    ) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.host_id != user_id {
                return;
            }
            room.max_buzzes_per_round = max_buzzes;
            let msg = WsServerMessage::RoomConfigUpdated { max_buzzes };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
        }
    }

    async fn handle_update_visibility(
        state: &SharedMatchState,
        room_id: Uuid,
        user_id: Uuid,
        visibility: crate::state::match_state::RoomVisibility,
    ) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.host_id != user_id {
                return;
            }
            room.visibility = visibility.clone();
            let msg = WsServerMessage::RoomVisibilityUpdated { visibility };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
        }
    }

    async fn handle_update_match_config(
        state: &SharedMatchState,
        room_id: Uuid,
        user_id: Uuid,
        config: crate::state::match_state::MatchConfig,
    ) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.host_id != user_id {
                return;
            }
            room.config = config.clone();

            // Broadcast the full room state update to ensure everyone has the new config
            let players: Vec<PlayerScoreDto> = room
                .players
                .values()
                .map(|p| PlayerScoreDto {
                    user_id: p.user_id,
                    username: p.username.clone(),
                    score: p.score,
                    icon_url: p.icon_url.clone(),
                })
                .collect();
            let msg = WsServerMessage::RoomStateUpdate {
                players,
                host_id: room.host_id,
                status: room.status.clone(),
                visibility: Some(room.visibility.clone()),
                preferred_mode: Some(room.preferred_mode.clone()),
                dummy_char_count: Some(room.dummy_char_count),
                buzzer_queue: room.buzzer_queue.clone(),
                config: room.config.clone(),
                questions: if room.status == RoomStatus::Playing {
                    Some(room.questions.iter().cloned().map(MatchQuestionDto::from).collect())
                } else {
                    None
                },
                current_question_index: if room.status == RoomStatus::Playing { Some(room.current_question_index) } else { None },
                round_sequence: if room.status == RoomStatus::Playing { Some(room.round_sequence) } else { None },
                active_buzzers: if room.status == RoomStatus::Playing { Some(room.active_buzzers.clone()) } else { None },
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
        }
    }

    async fn handle_back_to_lobby(state: &SharedMatchState, room_id: Uuid, user_id: Uuid) {
        let mut rooms = state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.host_id != user_id {
                return;
            }
            room.status = RoomStatus::Waiting;
            room.current_question_index = 0;
            room.buzzed_user_ids.clear();
            room.submitted_user_ids.clear();
            room.active_buzzers.clear();
            for player in room.players.values_mut() {
                player.score = 0;
                player.correct_answers = 0;
            }
            let players: Vec<PlayerScoreDto> = room
                .players
                .values()
                .map(|p| PlayerScoreDto {
                    user_id: p.user_id,
                    username: p.username.clone(),
                    score: p.score,
                    icon_url: p.icon_url.clone(),
                })
                .collect();
            let msg = WsServerMessage::RoomStateUpdate {
                players,
                host_id: room.host_id,
                status: room.status.clone(),
                visibility: Some(room.visibility.clone()),
                preferred_mode: Some(room.preferred_mode.clone()),
                dummy_char_count: Some(room.dummy_char_count),
                buzzer_queue: room.buzzer_queue.clone(),
                config: room.config.clone(),
                questions: if room.status == RoomStatus::Playing {
                    Some(room.questions.iter().cloned().map(MatchQuestionDto::from).collect())
                } else {
                    None
                },
                current_question_index: if room.status == RoomStatus::Playing { Some(room.current_question_index) } else { None },
                round_sequence: if room.status == RoomStatus::Playing { Some(room.round_sequence) } else { None },
                active_buzzers: if room.status == RoomStatus::Playing { Some(room.active_buzzers.clone()) } else { None },
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
        }
    }

    async fn handle_reset_match(
        state: &crate::state::AppState,
        room_id: Uuid,
        user_id: Uuid,
        collection_ids: Vec<Uuid>,
        _filter_node: Option<crate::dtos::quiz_dto::FilterNode>,
        sorts: Vec<crate::dtos::quiz_dto::SortCondition>,
        total_questions: usize,
        preferred_mode: Option<String>,
        dummy_char_count: Option<i32>,
    ) {
        use crate::repositories::question::QuestionRepository;
        use crate::state::match_state::MatchQuestion;

        if let Ok(colls) = sqlx::query!("SELECT id, name FROM collections").fetch_all(&state.db).await {
            debug!("Current database collections:");
            for c in colls {
                debug!("  ID: {}, Name: {}", c.id, c.name);
            }
        }

        debug!("handle_reset_match: user={}, collections={:?}, limit={}", user_id, collection_ids, total_questions);
        
        let all_questions = match QuestionRepository::find_filtered_questions(
            &state.db,
            &collection_ids,
            Some(user_id),
            _filter_node.as_ref(),
            &sorts,
        )
        .await {
            Ok(q) => q,
            Err(e) => {
                tracing::error!("find_filtered_questions failed: {}", e);
                Vec::new()
            }
        };

        debug!("find_filtered_questions found {} questions", all_questions.len());

        if all_questions.is_empty() {
            debug!("Reset failed for room {}: no questions found in collections {:?}", room_id, collection_ids);
            return;
        }

        let selected: Vec<MatchQuestion> = all_questions
            .into_iter()
            .take(total_questions)
            .map(|q| MatchQuestion {
                id: q.id,
                question_text: q.question_text,
                description_text: q.description_text,
                correct_answers: q.correct_answers,
                answer_rubis: q.answer_rubis,
                distractors: q.distractors,
                recommended_mode: q.recommended_mode,
            })
            .collect();

        let mut rooms = state.match_state.write().await;
        if let Some(room) = rooms.get_mut(&room_id) {
            if room.host_id != user_id {
                return;
            }
            room.questions = selected;
            if let Some(m) = preferred_mode {
                room.preferred_mode = m;
            }
            if let Some(c) = dummy_char_count {
                room.dummy_char_count = c;
            }
            room.status = RoomStatus::Waiting;
            room.current_question_index = 0;
            room.buzzed_user_ids.clear();
            room.submitted_user_ids.clear();
            room.active_buzzers.clear();
            for player in room.players.values_mut() {
                player.score = 0;
                player.correct_answers = 0;
            }

            let players: Vec<PlayerScoreDto> = room
                .players
                .values()
                .map(|p| PlayerScoreDto {
                    user_id: p.user_id,
                    username: p.username.clone(),
                    score: p.score,
                    icon_url: p.icon_url.clone(),
                })
                .collect();
            let msg = WsServerMessage::RoomStateUpdate {
                players,
                host_id: room.host_id,
                status: room.status.clone(),
                visibility: Some(room.visibility.clone()),
                preferred_mode: Some(room.preferred_mode.clone()),
                dummy_char_count: Some(room.dummy_char_count),
                buzzer_queue: room.buzzer_queue.clone(),
                config: room.config.clone(),
                questions: if room.status == RoomStatus::Playing {
                    Some(room.questions.iter().cloned().map(MatchQuestionDto::from).collect())
                } else {
                    None
                },
                current_question_index: if room.status == RoomStatus::Playing { Some(room.current_question_index) } else { None },
                round_sequence: if room.status == RoomStatus::Playing { Some(room.round_sequence) } else { None },
                active_buzzers: if room.status == RoomStatus::Playing { Some(room.active_buzzers.clone()) } else { None },
            };
            let _ = room.tx.send(serde_json::to_string(&msg).unwrap());
        }
    }
}
