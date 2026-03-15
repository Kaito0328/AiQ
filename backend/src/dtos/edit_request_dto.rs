use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEditRequest {
    pub question_id: Uuid,
    pub question_text: String,
    pub correct_answers: Vec<String>,
    pub answer_rubis: Vec<String>,
    pub distractors: Vec<String>,
    pub chip_answer: Option<String>,
    pub is_selection_only: bool,
    pub description_text: Option<String>,
    pub reason_id: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EditRequestResponse {
    pub id: Uuid,
    pub question_id: Uuid,
    pub requester_id: Uuid,
    pub requester_name: String,
    pub question_text: String,
    pub correct_answers: Vec<String>,
    pub answer_rubis: Vec<String>,
    pub distractors: Vec<String>,
    pub chip_answer: Option<String>,
    pub is_selection_only: bool,
    pub description_text: Option<String>,
    pub reason_id: i32,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub original_question_text: String,
    pub original_correct_answers: Vec<String>,
    pub original_answer_rubis: Vec<String>,
    pub original_distractors: Vec<String>,
    pub original_chip_answer: Option<String>,
    pub original_is_selection_only: bool,
    pub original_description_text: Option<String>,
    pub collection_name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEditRequestStatus {
    pub status: String, // approved, rejected
}
