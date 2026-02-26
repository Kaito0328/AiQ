use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub id: Uuid,
    pub collection_id: Uuid,
    pub question_text: String,
    pub correct_answer: String,
    pub description_text: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct UserQuestionStat {
    pub user_id: Uuid,
    pub question_id: Uuid,
    pub correct_count: i32,
    pub wrong_count: i32,
    pub is_last_correct: bool,
    pub updated_at: DateTime<Utc>,
}
