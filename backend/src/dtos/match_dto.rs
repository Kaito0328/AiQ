use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::state::match_state::MatchQuestion;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateMatchRoomRequest {
    pub collection_ids: Vec<Uuid>,
    pub filter_types: Vec<String>,
    pub sort_keys: Vec<String>,
    pub total_questions: i64,
    pub max_buzzes_per_round: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateMatchRoomResponse {
    pub room_id: Uuid,
    pub join_token: String, // Optional, for private URL sharing
}

#[derive(Debug, Serialize, Clone)]
pub struct MatchQuestionDto {
    pub id: Uuid,
    pub question_text: String,
    pub description_text: Option<String>,
    // Notice: `correct_answer` is intentionally omitted
}

impl From<MatchQuestion> for MatchQuestionDto {
    fn from(q: MatchQuestion) -> Self {
        Self {
            id: q.id,
            question_text: q.question_text,
            description_text: q.description_text,
        }
    }
}
