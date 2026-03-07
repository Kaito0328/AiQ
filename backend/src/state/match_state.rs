use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{RwLock, broadcast};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct PlayerState {
    pub user_id: Uuid,
    pub username: String,
    pub score: i64,
    pub icon_url: Option<String>,
    pub correct_answers: i32,
}

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RoomStatus {
    Waiting,
    Playing,
    Finished,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum RoomVisibility {
    Public,
    Private,
    Followers,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchConfig {
    pub text_timer_s: u64,
    pub chips_char_timer_s: u64,
    pub choice_timer_s: u64,
    pub base_score: i64,
    pub speed_bonus_max: i64,     // 1st buzz bonus
    pub penalty: i64,             // wrong answer penalty
    pub first_wrong_penalty: i64, // extra penalty for the 1st buzzer on wrong answer
    pub win_score: Option<i64>,   // None = infinite (no win threshold)
    pub post_round_delay_seconds: u64,
}

impl Default for MatchConfig {
    fn default() -> Self {
        Self {
            text_timer_s: 20,
            chips_char_timer_s: 5,
            choice_timer_s: 5,
            base_score: 10,
            speed_bonus_max: 10,
            penalty: 10,
            first_wrong_penalty: 10,
            win_score: Some(100),
            post_round_delay_seconds: 5,
        }
    }
}

#[derive(Debug, Clone)]
pub struct MatchQuestion {
    pub id: Uuid,
    pub question_text: String,
    pub description_text: Option<String>,
    pub correct_answers: Vec<String>,
    pub answer_rubis: Vec<String>,
    pub distractors: Vec<String>,
    pub recommended_mode: String,
}

#[derive(Debug)]
pub struct RoomState {
    pub room_id: Uuid,
    pub host_id: Uuid,
    pub host_username: String,
    pub visibility: RoomVisibility,
    pub status: RoomStatus,
    pub players: HashMap<Uuid, PlayerState>,
    // The actual questions (including answers for server-side validation)
    pub questions: Vec<MatchQuestion>,
    pub current_question_index: usize,
    pub buzzed_user_ids: Vec<Uuid>,
    pub buzzer_queue: Vec<Uuid>,
    pub max_buzzes_per_round: usize,
    pub config: MatchConfig,
    pub tx: broadcast::Sender<String>,
    pub round_sequence: i32,
    pub active_buzzer: Option<Uuid>,
    pub expires_at_ms: Option<u64>,
    pub submitted_user_ids: Vec<Uuid>,
    pub preferred_mode: String,
    pub dummy_char_count: i32,
    pub empty_since: Option<u64>,
}

impl RoomState {
    pub fn new(
        room_id: Uuid,
        host_id: Uuid,
        host_username: String,
        questions: Vec<MatchQuestion>,
        max_buzzes: usize,
        visibility: RoomVisibility,
        preferred_mode: String,
        dummy_char_count: i32,
    ) -> Self {
        let (tx, _) = broadcast::channel(100);
        Self {
            room_id,
            host_id,
            host_username,
            visibility,
            status: RoomStatus::Waiting,
            players: HashMap::new(),
            questions,
            current_question_index: 0,
            buzzed_user_ids: Vec::new(),
            buzzer_queue: Vec::new(),
            max_buzzes_per_round: max_buzzes,
            config: MatchConfig::default(),
            tx,
            round_sequence: 0,
            active_buzzer: None,
            expires_at_ms: None,
            submitted_user_ids: Vec::new(),
            preferred_mode,
            dummy_char_count,
            empty_since: None,
        }
    }
}

pub type SharedMatchState = Arc<RwLock<HashMap<Uuid, RoomState>>>;
