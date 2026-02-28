use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
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

#[derive(Debug, Clone)]
pub struct MatchQuestion {
    pub id: Uuid,
    pub question_text: String,
    pub description_text: Option<String>,
    pub correct_answers: Vec<String>,
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
    pub max_buzzes_per_round: usize,
    pub tx: broadcast::Sender<String>,
    pub round_sequence: i32,
    pub active_buzzer: Option<Uuid>,
    pub submitted_user_ids: Vec<Uuid>,
}

impl RoomState {
    pub fn new(
        room_id: Uuid,
        host_id: Uuid,
        host_username: String,
        questions: Vec<MatchQuestion>,
        max_buzzes: usize,
        visibility: RoomVisibility,
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
            max_buzzes_per_round: max_buzzes,
            tx,
            round_sequence: 0,
            active_buzzer: None,
            submitted_user_ids: Vec::new(),
        }
    }
}

pub type SharedMatchState = Arc<RwLock<HashMap<Uuid, RoomState>>>;
