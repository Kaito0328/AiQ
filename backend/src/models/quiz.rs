use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct CasualQuiz {
    pub id: Uuid,
    pub user_id: Uuid,

    // PostgreSQLの TEXT[] は Vec<String> に対応
    pub filter_types: Vec<String>,
    pub sort_keys: Vec<String>,
    pub collection_names: Vec<String>,

    // PostgreSQLの UUID[] は Vec<Uuid> に対応
    pub question_ids: Vec<Uuid>,
    pub answered_question_ids: Vec<Uuid>,

    pub total_questions: i32,
    pub correct_count: i32,
    pub elapsed_time_millis: i64, // BIGINT は i64
    pub is_active: bool,

    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct CasualQuizAnswer {
    pub id: Uuid,
    pub quiz_id: Uuid,
    pub question_id: Uuid,
    pub user_answer: Option<String>, // 未回答などの可能性を考慮してOption
    pub is_correct: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct RankingRecord {
    pub id: Uuid,
    pub user_id: Uuid,
    pub collection_id: Uuid,
    pub score: i32,
    pub correct_count: i32,
    pub total_questions: i32,
    pub total_time_millis: i64,
    pub used_hint_count: i32,
    pub created_at: DateTime<Utc>,
}
