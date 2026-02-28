use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct RankingQuiz {
    pub id: Uuid,
    pub user_id: Uuid,
    pub collection_id: Uuid,
    pub question_ids: Vec<Uuid>,
    pub answered_question_ids: Vec<Uuid>,
    pub total_questions: i32,
    pub correct_count: i32,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct RankingQuizAnswer {
    pub id: Uuid,
    pub ranking_quiz_id: Uuid,
    pub question_id: Uuid,
    pub user_answer: Option<String>,
    pub is_correct: bool,
    pub time_taken_millis: i64,
    pub created_at: DateTime<Utc>,
}
