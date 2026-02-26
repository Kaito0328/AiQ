use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartCasualQuizRequest {
    pub collection_ids: Vec<Uuid>,
    pub collection_set_id: Option<Uuid>,
    pub filter_types: Vec<String>,
    pub sort_keys: Vec<String>,
    pub total_questions: i32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmitAnswerRequest {
    pub question_id: Uuid,
    pub user_answer: String,
    pub elapsed_millis: i64, // 今回の回答にかかった時間
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CasualQuizResponse {
    pub id: Uuid,
    pub collection_names: Vec<String>,
    pub total_questions: i32,
    pub question_ids: Vec<Uuid>,
    pub answered_question_ids: Vec<Uuid>,
    pub correct_count: i32,
    pub elapsed_time_millis: i64,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

use crate::models::{quiz::CasualQuiz, question::Question, quiz::CasualQuizAnswer};

impl From<CasualQuiz> for CasualQuizResponse {
    fn from(quiz: CasualQuiz) -> Self {
        Self {
            id: quiz.id,
            collection_names: quiz.collection_names,
            total_questions: quiz.total_questions,
            question_ids: quiz.question_ids,
            answered_question_ids: quiz.answered_question_ids,
            correct_count: quiz.correct_count,
            elapsed_time_millis: quiz.elapsed_time_millis,
            is_active: quiz.is_active,
            created_at: quiz.created_at,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnswerHistoryOutput {
    pub question_id: Uuid,
    pub user_answer: Option<String>,
    pub is_correct: bool,
}

impl From<CasualQuizAnswer> for AnswerHistoryOutput {
    fn from(ans: CasualQuizAnswer) -> Self {
        Self {
            question_id: ans.question_id,
            user_answer: ans.user_answer,
            is_correct: ans.is_correct,
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuizStartResponse {
    pub quiz: CasualQuizResponse,
    pub questions: Vec<Question>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuizResumeResponse {
    pub quiz: CasualQuizResponse,
    pub questions: Vec<Question>,
    pub answers: Vec<AnswerHistoryOutput>,
}
