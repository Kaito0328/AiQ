use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateQuestionRequest {
    pub question_text: String,
    pub correct_answers: Vec<String>,
    pub description_text: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateQuestionRequest {
    pub question_text: String,
    pub correct_answers: Vec<String>,
    pub description_text: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertQuestionItem {
    pub id: Option<uuid::Uuid>,
    pub question_text: Option<String>,
    pub correct_answers: Option<Vec<String>>,
    pub description_text: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchQuestionsRequest {
    pub upsert_items: Vec<UpsertQuestionItem>,
    pub delete_ids: Vec<uuid::Uuid>,
}
