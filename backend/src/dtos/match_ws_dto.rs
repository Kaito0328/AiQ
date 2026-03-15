use crate::dtos::quiz_dto::{FilterNode, SortCondition};
use crate::dtos::match_dto::MatchQuestionDto;
use crate::state::match_state::{RoomStatus, RoomVisibility};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum WsClientMessage {
    JoinRoom {
        room_id: Uuid,
        join_token: String,
    },
    StartMatch, // Host only
    Buzz,
    SubmitAnswer {
        answer: String,
    },
    SubmitPartialAnswer {
        answer: String,
    },
    UpdateConfig {
        max_buzzes: usize,
    },
    BackToLobby,
    ResetMatch {
        collection_ids: Vec<Uuid>,
        filter_node: Option<FilterNode>,
        sorts: Vec<SortCondition>,
        total_questions: usize,
        preferred_mode: Option<String>,
        dummy_char_count: Option<i32>,
    },
    UpdateVisibility {
        visibility: RoomVisibility,
    },
    UpdateMatchConfig {
        config: crate::state::match_state::MatchConfig,
    },
    Ping,
}

#[derive(Debug, Serialize, Clone)]
pub struct PlayerScoreDto {
    pub user_id: Uuid,
    pub username: String,
    pub score: i64,
    pub icon_url: Option<String>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type")]
pub enum WsServerMessage {
    Error {
        message: String,
    },
    RoomStateUpdate {
        players: Vec<PlayerScoreDto>,
        host_id: Uuid,
        status: RoomStatus,
        visibility: Option<RoomVisibility>,
        preferred_mode: Option<String>,
        dummy_char_count: Option<i32>,
        buzzer_queue: Vec<Uuid>,
        config: crate::state::match_state::MatchConfig,
        // Match state sync for late joiners
        #[serde(skip_serializing_if = "Option::is_none")]
        questions: Option<Vec<MatchQuestionDto>>,
        #[serde(skip_serializing_if = "Option::is_none")]
        current_question_index: Option<usize>,
        #[serde(skip_serializing_if = "Option::is_none")]
        round_sequence: Option<i32>,
        #[serde(skip_serializing_if = "Option::is_none")]
        active_buzzers: Option<std::collections::HashMap<Uuid, u64>>,
    },
    MatchStarted {
        questions: Vec<MatchQuestionDto>,
        max_buzzes: usize,
        total_questions: usize,
        preferred_mode: String,
        dummy_char_count: i32,
        config: crate::state::match_state::MatchConfig,
    },
    RoundStarted {
        question_index: usize,
        expires_at_ms: u64,
    },
    PlayerBuzzed {
        user_id: Uuid, // The user who just buzzed
        buzzed_user_ids: Vec<Uuid>,
        submitted_user_ids: Vec<Uuid>,
        buzzer_queue: Vec<Uuid>,
        active_buzzers: std::collections::HashMap<Uuid, u64>, // user_id -> expires_at_ms
    },
    PartialAnswerUpdate {
        user_id: Uuid,
        answer: String,
        active_buzzers: std::collections::HashMap<Uuid, u64>, // Included to sync individual timers
    },
    AnswerResult {
        user_id: Uuid,
        is_correct: bool,
        new_score: i64,
        submitted_user_ids: Vec<Uuid>,
    },
    RoundResult {
        correct_answer: String,
        scores: Vec<PlayerScoreDto>,
    },
    MatchResult {
        final_scores: Vec<PlayerScoreDto>,
    },
    RoomConfigUpdated {
        max_buzzes: usize,
    },
    RoomVisibilityUpdated {
        visibility: RoomVisibility,
    },
    Joined {
        user_id: Uuid,
        username: String,
        server_now_ms: u64,
    },
    Pong,
}
