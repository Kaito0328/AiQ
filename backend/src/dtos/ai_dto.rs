use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct GenerateQuestionsRequest {
    pub prompt: String,
    pub count: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeneratedQuestion {
    pub question_text: String,
    pub correct_answer: String,
    pub description_text: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct WsMessage {
    pub status: String,
    pub message: String,
    pub data: Option<Vec<GeneratedQuestion>>,
}
