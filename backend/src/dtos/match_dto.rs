use crate::state::match_state::{MatchQuestion, RoomVisibility};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateMatchRoomRequest {
    pub collection_ids: Vec<Uuid>,
    pub filter_types: Vec<String>,
    pub sort_keys: Vec<String>,
    pub total_questions: i64,
    pub max_buzzes_per_round: usize,
    pub visibility: Option<RoomVisibility>,
    pub preferred_mode: Option<String>,
    pub dummy_char_count: Option<i32>,
    pub config: Option<crate::state::match_state::MatchConfig>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateMatchRoomResponse {
    pub room_id: Uuid,
    pub join_token: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchRoomListItem {
    pub room_id: Uuid,
    pub host_id: Uuid,
    pub host_username: String,
    pub player_count: usize,
    pub status: String,
    pub total_questions: usize,
}

#[derive(Debug, Serialize, Clone)]
pub struct MatchQuestionDto {
    pub id: Uuid,
    pub question_text: String,
    pub description_text: Option<String>,
    pub correct_answers: Vec<String>,
    pub answer_rubis: Vec<String>,
    pub distractors: Vec<String>,
    pub recommended_mode: String,
}

impl From<MatchQuestion> for MatchQuestionDto {
    fn from(q: MatchQuestion) -> Self {
        Self {
            id: q.id,
            question_text: q.question_text,
            description_text: q.description_text,
            correct_answers: q.correct_answers,
            answer_rubis: q.answer_rubis,
            distractors: q.distractors,
            recommended_mode: q.recommended_mode,
        }
    }
}
