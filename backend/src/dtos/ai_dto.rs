use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateQuestionsRequest {
    pub prompt: String,
    pub count: Option<i32>,
    pub pdf_data: Option<String>, // Base64 encoded PDF
    pub question_format: Option<String>,
    pub answer_format: Option<String>,
    pub example_question: Option<String>,
    pub example_answer: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratedQuestion {
    pub id: Option<String>,
    pub question_text: String,
    pub correct_answers: Vec<String>,
    pub description_text: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WsMessage {
    pub status: String,
    pub message: String,
    pub data: Option<Vec<GeneratedQuestion>>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PartialQuestion {
    pub id: Option<String>,
    pub question_text: Option<String>,
    pub correct_answers: Option<Vec<String>>,
    pub description_text: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompleteQuestionsRequest {
    pub items: Vec<PartialQuestion>,
    pub complete_description: Option<bool>,
    pub question_format: Option<String>,
    pub answer_format: Option<String>,
}
