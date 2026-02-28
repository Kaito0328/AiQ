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
        pdf_data: Option<&str>,
        question_format: Option<&str>,
        answer_format: Option<&str>,
        example_question: Option<&str>,
        example_answer: Option<&str>,
    ) -> Result<Vec<GeneratedQuestion>, AppError> {
        let api_key = env::var("GEMINI_API_KEY").map_err(|_| {
            AppError::InternalServerError("GEMINI_API_KEY must be set".to_string())
        })?;

        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
            api_key
        );

        let mut format_instruction = String::new();
        if let Some(qf) = question_format {
            format_instruction.push_str(&format!("\n- Question Format: {}", qf));
        }
        if let Some(af) = answer_format {
            format_instruction.push_str(&format!("\n- Answer Format: {}", af));
        }
        if let (Some(eq), Some(ea)) = (example_question, example_answer) {
            format_instruction.push_str(&format!(
                "\n- Example: Question: \"{}\", Answer: \"{}\"",
                eq, ea
            ));
        }

        let system_instruction = format!(
            "You are a helpful quiz generator. Generate exactly {} questions based on the provided topic or text. \
            Output must be purely in a JSON array format where each element is an object strictly containing:\
            \n- \"questionText\" (string)\n- \"correctAnswers\" (array of strings: MUST be very short phrases, ideally single words, nouns, numbers, or booleans suitable for exact-match grading. If there are multiple valid interpretations or spellings, include them all in this array)\n- \"descriptionText\" (string or null).{}\
            \nDo not include Markdown blocks (like ```json), just output the raw JSON array. Make sure the output is a valid JSON array.",
            count,
            format_instruction
        );

        let mut contents_parts = Vec::new();

        // If PDF data is provided, add it as inlineData
        if let Some(data) = pdf_data {
            contents_parts.push(json!({
                "inlineData": {
                    "mimeType": "application/pdf",
                    "data": data
                }
            }));
        }

        // Add the prompt text
        contents_parts.push(json!({
            "text": prompt
        }));

        let client = Client::new();
        let payload = json!({
            "system_instruction": {
                "parts": [{ "text": system_instruction }]
            },
            "contents": [
                {
                    "parts": contents_parts
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

    pub async fn complete_questions(
        items: Vec<crate::dtos::ai_dto::PartialQuestion>,
        complete_description: bool,
        question_format: Option<String>,
        answer_format: Option<String>,
    ) -> Result<Vec<GeneratedQuestion>, AppError> {
        let api_key = env::var("GEMINI_API_KEY").map_err(|_| {
            AppError::InternalServerError("GEMINI_API_KEY must be set".to_string())
        })?;

        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
            api_key
        );

        let mut format_instruction = String::new();
        if let Some(qf) = question_format {
            format_instruction.push_str(&format!("\n- Question Format Rule: {}", qf));
        }
        if let Some(af) = answer_format {
            format_instruction.push_str(&format!("\n- Answer Format Rule: {}", af));
        }

        let items_count = items.len();
        let description_rule = if complete_description {
            "3. Fill in the missing fields (questionText, correctAnswers, and/or descriptionText)."
        } else {
            "3. Fill in the missing fields (questionText and/or correctAnswers). DO NOT generate or fill descriptionText if it is null in the input."
        };

        let system_instruction = format!(
            "You are a quiz data completion assistant. \
            Your task is to review a list of {} items and fill in the missing fields. \
            Follow these rules strictly:\
            1. DO NOT change any fields that already have content. Treat empty strings or null as missing content.\
            2. Infer content based on other fields in the SAME item and neighboring items to maintain language, style, and difficulty.\
            {}\
            4. If filling Question Text for a given Answer, ensure the question specifically leads to that answer. Do not hallucinate unrelated topics.\
            5. Return a JSON array of EXACTLY {} objects. Maintain the EXACT same order and use the EXACT same 'id' for each item as provided in the input.\
            {}\
            7. Each object must contain: 'id' (from input), 'questionText' (string), 'correctAnswers' (array of strings), and 'descriptionText' (string or null).",
            items_count, description_rule, items_count, format_instruction
        );

        let user_prompt = serde_json::to_string(&items).map_err(|e| {
            AppError::InternalServerError(format!("Failed to serialize items: {}", e))
        })?;

        let payload = serde_json::json!({
            "contents": [{
                "parts": [{
                    "text": user_prompt
                }]
            }],
            "system_instruction": {
                "parts": [{
                    "text": system_instruction
                }]
            },
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "string" },
                            "questionText": { "type": "string" },
                            "correctAnswers": { "type": "array", "items": { "type": "string" } },
                            "descriptionText": { "type": "string" }
                        },
                        "required": ["id", "questionText", "correctAnswers"]
                    }
                }
            }
        });

        let client = reqwest::Client::new();
        let response = client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|e| AppError::InternalServerError(format!("Failed to send request to Gemini: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::InternalServerError(format!("Gemini API error: {}", error_text)));
        }

        let resp_json: serde_json::Value = response.json().await.map_err(|e| {
            AppError::InternalServerError(format!("Failed to parse Gemini response: {}", e))
        })?;

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

        let questions: Vec<GeneratedQuestion> = serde_json::from_str(ai_text).map_err(|e| {
            AppError::InternalServerError(format!("Failed to parse completed questions JSON: {}. Text: {}", e, ai_text))
        })?;

        Ok(questions)
    }
}
