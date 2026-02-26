use std::env;
use reqwest::Client;
use serde_json::json;
use crate::dtos::ai_dto::GeneratedQuestion;
use crate::error::AppError;

pub struct AiService;

impl AiService {
    pub async fn generate_questions(
        prompt: &str,
        count: i32,
    ) -> Result<Vec<GeneratedQuestion>, AppError> {
        let api_key = env::var("GEMINI_API_KEY").map_err(|_| {
            AppError::InternalServerError("GEMINI_API_KEY must be set".to_string())
        })?;

        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
            api_key
        );

        let system_instruction = format!(
            "You are a helpful quiz generator. Generate exactly {} questions based on the provided topic or text. \
            Output must be purely in a JSON array format where each element is an object strictly containing:\
            \n- \"question_text\" (string)\n- \"correct_answer\" (string: MUST be a very short phrase, ideally a single word, noun, number, or boolean suitable for exact-match grading)\n- \"description_text\" (string or null).\
            \nDo not include Markdown blocks (like ```json), just output the raw JSON array. Make sure the output is a valid JSON array.",
            count
        );

        let client = Client::new();
        let payload = json!({
            "system_instruction": {
                "parts": [{ "text": system_instruction }]
            },
            "contents": [
                {
                    "parts": [{ "text": prompt }]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
            }
        });

        let response = client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|e| AppError::InternalServerError(format!("AI API Request Failed: {}", e)))?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            return Err(AppError::InternalServerError(format!(
                "AI API Error {}: {}",
                status, text
            )));
        }

        let resp_json: serde_json::Value = response
            .json()
            .await
            .map_err(|e| AppError::InternalServerError(format!("Failed to parse response AI JSON: {}", e)))?;

        let ai_text = resp_json
            .get("candidates")
            .and_then(|c| c.as_array())
            .and_then(|c| c.first())
            .and_then(|first| first.get("content"))
            .and_then(|content| content.get("parts"))
            .and_then(|parts| parts.as_array())
            .and_then(|parts| parts.first())
            .and_then(|first| first.get("text"))
            .and_then(|text| text.as_str())
            .ok_or_else(|| {
                AppError::InternalServerError("Failed to extract JSON string from AI response".to_string())
            })?;

        let qs: Vec<GeneratedQuestion> = serde_json::from_str(ai_text).map_err(|e| {
            AppError::InternalServerError(format!("Failed to parse AI structure into Questions: {}. Text: {}", e, ai_text))
        })?;

        Ok(qs)
    }
}
