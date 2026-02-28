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

        let mut format_rules = String::new();
        if let Some(qf) = question_format {
            format_rules.push_str(&format!("\n- [MANDATORY] Question Style/Language: {}", qf));
        }
        if let Some(af) = answer_format {
            format_rules.push_str(&format!("\n- [MANDATORY] Answer Style/Language: {}", af));
        }
        if let (Some(eq), Some(ea)) = (example_question, example_answer) {
            format_rules.push_str(&format!(
                "\n- [REFERENCE EXAMPLE] Question: \"{}\", Answer: \"{}\"",
                eq, ea
            ));
        }

        let system_instruction = format!(
            "You are a professional quiz generator. Your task is to generate exactly {} questions based on the user's prompt or text.\n\n\
            ## STRICT STYLE AND FORMAT RULES:\n\
            You MUST follow these rules for every question. If a rule contradicts a common pattern (e.g., TOEIC format), the rule here TAKES PRECEDENCE.\n\
            {}\n\n\
            ## OUTPUT JSON SPECIFICATION:\n\
            Return a JSON array of objects. Each object MUST strictly contain:\n\
            1. \"questionText\": (string) The question following the Style Rules.\n\
            2. \"correctAnswers\": (array of strings) Short, concise answers (ideally single words/nouns). Include common variations.\n\
            3. \"descriptionText\": (string or null) A brief explanation.\n\n\
            ## CONSTRAINTS:\n\
            - If '単語' (word) is requested for a format, do NOT generate full sentences or cloze deletion.\n\
            - Respect the requested language for each field.\n\
            - Output raw JSON only. Do NOT use markdown backticks.",
            count,
            if format_rules.is_empty() { "Use the most appropriate style for the topic." } else { &format_rules }
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
                "responseSchema": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "questionText": { "type": "string" },
                            "correctAnswers": { "type": "array", "items": { "type": "string" } },
                            "descriptionText": { "type": "string" }
                        },
                        "required": ["questionText", "correctAnswers"]
                    }
                }
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

        let mut format_rules = String::new();
        if let Some(qf) = question_format {
            format_rules.push_str(&format!("\n- [MANDATORY] Question Style/Language: {}", qf));
        }
        if let Some(af) = answer_format {
            format_rules.push_str(&format!("\n- [MANDATORY] Answer Style/Language: {}", af));
        }

        let items_count = items.len();
        let description_rule = if complete_description {
            "3. Fill in the missing fields (questionText, correctAnswers, and/or descriptionText)."
        } else {
            "3. Fill in the missing fields (questionText and/or correctAnswers). DO NOT generate or fill descriptionText if it is null in the input."
        };

        let system_instruction = format!(
            "You are a professional quiz data completion assistant. Your task is to review a list of {} items and fill in the missing fields.\n\n\
            ## STRICT STYLE AND FORMAT RULES:\n\
            You MUST follow these rules for every field you fill. If a rule contradicts common patterns, the rule here TAKES PRECEDENCE.\n\
            {}\n\n\
            ## COMPLETION LOGIC:\n\
            1. DO NOT change any fields that already have content. Treat empty strings or null as missing content.\n\
            2. Infer content based on other fields in the SAME item and neighboring items to maintain language, style, and difficulty.\n\
            {}\n\
            4. If filling 'questionText' for a given Answer, ensure the question specifically leads to that answer.\n\
            5. Return a JSON array of EXACTLY {} objects. Maintain the EXACT same order and use the EXACT same 'id' for each item as provided in the input.\n\n\
            ## CONSTRAINTS:\n\
            - If '単語' (word) is requested for a format, do NOT generate full sentences or cloze deletion.\n\
            - Respect the requested language for each field.\n\
            - Output raw JSON only.",
            items_count,
            if format_rules.is_empty() { "No specific format rules. Use the most appropriate style for the topic." } else { &format_rules },
            description_rule,
            items_count
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
