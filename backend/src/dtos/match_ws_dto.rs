use crate::dtos::match_dto::MatchQuestionDto;
use crate::state::match_state::{RoomStatus, RoomVisibility};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum WsClientMessage {
    JoinRoom { room_id: Uuid, join_token: String },
    StartMatch, // Host only
    Buzz,
    SubmitAnswer { answer: String },
    UpdateConfig { max_buzzes: usize },
    BackToLobby,
    ResetMatch { 
        collection_ids: Vec<Uuid>, 
        filter_types: Vec<String>,
        sort_keys: Vec<String>,
        total_questions: usize 
    },
    UpdateVisibility { visibility: RoomVisibility },
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
    Error { message: String },
    RoomStateUpdate { players: Vec<PlayerScoreDto>, host_id: Uuid, status: RoomStatus },
    MatchStarted { questions: Vec<MatchQuestionDto>, max_buzzes: usize, total_questions: usize },
    RoundStarted { question_index: usize, expires_at_ms: u64 },
    PlayerBuzzed { user_id: Uuid, expires_at_ms: u64, buzzed_user_ids: Vec<Uuid>, submitted_user_ids: Vec<Uuid> },
    AnswerResult { user_id: Uuid, is_correct: bool, new_score: i64, submitted_user_ids: Vec<Uuid> },
    RoundResult { correct_answer: String, scores: Vec<PlayerScoreDto> },
    MatchResult { final_scores: Vec<PlayerScoreDto> },
    RoomConfigUpdated { max_buzzes: usize },
    RoomVisibilityUpdated { visibility: RoomVisibility },
    Joined { user_id: Uuid, username: String },
}
