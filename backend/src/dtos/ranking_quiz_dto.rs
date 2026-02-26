use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartRankingQuizRequest {
    pub collection_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RankingQuizQuestionDto {
    pub id: Uuid,
    pub question_text: String,
    // Note: correct_answer is explicitly hidden
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartRankingQuizResponse {
    pub quiz_id: Uuid,
    pub collection_id: Uuid,
    pub total_questions: i32,
    pub started_at: DateTime<Utc>,
    pub questions: Vec<RankingQuizQuestionDto>, // Returns all questions (answers hidden)
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RankingQuizAnswerDto {
    pub question_id: Uuid,
    pub answer: String,
    pub time_taken_millis: i64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmitRankingAllAnswersRequest {
    pub answers: Vec<RankingQuizAnswerDto>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmitRankingAnswerRequest {
    pub question_id: Uuid,
    pub answer: String,
    pub time_taken_millis: i64, // Optional tracking of time per question from client
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmitRankingAnswerResponse {
    pub is_correct: bool,
    pub correct_answer: String, // Reveal correct answer after submission
    pub description_text: Option<String>,
    pub next_question: Option<RankingQuizQuestionDto>,
    pub is_completed: bool,
    pub result: Option<RankingQuizResultDto>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RankingAnswerResultDto {
    pub question_id: Uuid,
    pub is_correct: bool,
    pub correct_answer: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RankingQuizResultDto {
    pub quiz_id: Uuid,
    pub collection_id: Uuid,
    pub score: i32,
    pub correct_count: i32,
    pub total_questions: i32,
    pub total_time_millis: i64,
    pub completed_at: DateTime<Utc>,
    pub rank: Option<i64>,
    pub detailed_results: Vec<RankingAnswerResultDto>,
}
