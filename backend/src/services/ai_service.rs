use crate::dtos::ai_dto::GeneratedQuestion;
use crate::error::AppError;
use reqwest::Client;
use serde_json::json;
use std::env;

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
        explanation_language: Option<&str>,
    ) -> Result<Vec<GeneratedQuestion>, AppError> {
        let api_key = env::var("GEMINI_API_KEY")
            .map_err(|_| AppError::InternalServerError("GEMINI_API_KEY must be set".to_string()))?;

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
        if let Some(el) = explanation_language {
            format_rules.push_str(&format!("\n- [MANDATORY] Explanation Language: {}", el));
        }

        let system_instruction = format!(
            "あなたはプロのクイズ作成アシスタントです。ユーザーの指示やテキストに基づき、正確に {} 問のクイズを生成してください。\n\n\
        ## スタイルおよびフォーマットに関するルール:\n\
        1. [MANDATORY] で指定された形式（単語、文章、穴埋め等）と [REFERENCE EXAMPLE] のスタイルを最優先で遵守してください。\n\
        2. 指示に矛盾がある場合、直近のユーザー指定を優先してください。\n\
        {}\n\n\
        ## フィールド別詳細指示:\n\
        1. \"questionText\": 問題文。\n\
           - [MANDATORY] Question Style/Language の形式を厳密に継承してください。\n\
           - 形式が「単語」の場合は、説明的な文章や文脈を含めず、単語のみを出力してください。\n\
           - 形式が「文章」や「穴埋め」の場合は、それに適した完全な文章または穴埋め文（______等を含む）を作成してください。\n\
        2. \"correctAnswers\": 正解。\n\
           - [MANDATORY] Answer Style/Language の形式を厳守してください。\n\
           - **最も一般的・標準的な解答を必ず先頭（インデックス0）に含めてください。** この最初の解答が代表的な解答として優先的に使用されます。\n\
           - 同義語、略称、表記揺れを【積極的に】複数含めてください（例：[\"沖縄\", \"沖縄県\"], [\"AI\", \"人工知能\"], [\"PC\", \"パーソナルコンピュータ\"]）。\n\
        3. \"answerRubis\": 読み（ひらがな/カタカナ）。\n\
           - 漢字を含む解答に対してのみ、その読みのかなを生成してください。\n\
           - アルファベットや記号（例：CPU）が含まれる場合は、ユーザーの利便性のためにそれらをそのまま残しつつ、漢字部分のみを読みかなに変換した文字列にすることを推奨します（例：'CPU（ちゅうおうしょりそうち）' や 'ちゅうおうしょりそうち' など）。\n\
           - 漢字を一切含まない場合は空文字 (\"\")。\n\
        4. \"distractors\": 誤答を正確に 3 つ。正解とは明確に異なる一貫した難易度のものを作成してください。\n\
        5. \"recommendedMode\": クイズの性質に基づいた推奨解答形式（\"fourChoice\", \"chips\", \"text\"）。\n\
           - \"fourChoice\": 解答が一意に定まりにくい問題（英文の穴埋め等）や、選択肢があることで正解が特定できるような一般的な問題に適しています。**解答の選択肢（distractors）が重要な場合はこれを優先してください。**\n\
           - \"chips\": 穴埋め問題（短文）や、一文字ずつ選んで解答させるパズル形式に適しています。解答が固有名詞などの「想起」を主とする場合はこれまたは \"text\" を選んでください。\n\
           - \"text\": 答えが一意に定まり、直接的な想起を促すべき問題（単語の翻訳、短い事実確認など）に適しています。\n\
        6. \"descriptionText\": 解説。\n\
           - [MANDATORY] Explanation Language が指定されている場合はその言語で作成してください。\n\
           - 指定がない場合は、学習テーマや問題文、正解の言語から最も適切な解説言語を推測してください（例：テーマが「英単語」で問題が英単語なら解説は日本語、テーマが「世界史」で内容が日本語なら解説も日本語、など）。\n\n\
        ## 徹底禁止事項:\n\
        - 言語の逆転（問題に英単語、正解に日本語など）は、ユーザーの明示的な指定がない限り行わないでください。\n\
        - 出力は生の JSON のみとし、 markdown のコードブロック（```）で囲まないでください。",
            count,
            if format_rules.is_empty() {
                "トピックに適したクイズを作成してください。"
            } else {
                &format_rules
            }
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
                            "answerRubis": { "type": "array", "items": { "type": "string" } },
                            "distractors": { "type": "array", "items": { "type": "string" } },
                            "recommendedMode": { "type": "string" },
                            "descriptionText": { "type": "string" }
                        },
                        "required": ["questionText", "correctAnswers", "answerRubis", "distractors", "recommendedMode"]
                    }
                }
            }
        });

        let response =
            client.post(&url).json(&payload).send().await.map_err(|e| {
                AppError::InternalServerError(format!("AI API Request Failed: {}", e))
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            return Err(AppError::InternalServerError(format!(
                "AI API Error {}: {}",
                status, text
            )));
        }

        let resp_json: serde_json::Value = response.json().await.map_err(|e| {
            AppError::InternalServerError(format!("Failed to parse response AI JSON: {}", e))
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
                AppError::InternalServerError(
                    "Failed to extract JSON string from AI response".to_string(),
                )
            })?;

        let qs: Vec<GeneratedQuestion> = serde_json::from_str(ai_text).map_err(|e| {
            AppError::InternalServerError(format!(
                "Failed to parse AI structure into Questions: {}. Text: {}",
                e, ai_text
            ))
        })?;

        Ok(qs)
    }

    pub async fn complete_questions(
        items: Vec<crate::dtos::ai_dto::PartialQuestion>,
        complete_description: bool,
        question_format: Option<String>,
        answer_format: Option<String>,
        explanation_language: Option<String>,
    ) -> Result<Vec<GeneratedQuestion>, AppError> {
        let api_key = env::var("GEMINI_API_KEY")
            .map_err(|_| AppError::InternalServerError("GEMINI_API_KEY must be set".to_string()))?;

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
        if let Some(el) = explanation_language {
            format_rules.push_str(&format!("\n- [MANDATORY] Explanation Language: {}", el));
        }

        let items_count = items.len();
        let description_rule_jp = if complete_description {
            "3. 不足しているフィールド (questionText, correctAnswers, descriptionText) をすべて入力してください。"
        } else {
            "3. 不足しているフィールド (questionText, correctAnswers) を入力してください。入力がnullの場合でも、descriptionText は生成しないでください。"
        };

        let system_instruction = format!(
            "あなたはプロのクイズデータ補完アシスタントです。{} 件のアイテムの不足フィールドを補完してください。\n\n\
            ## スタイルおよびフォーマットに関するルール:\n\
            1. [MANDATORY] で指定された形式と [REFERENCE EXAMPLE] のスタイルを最優先で遵守してください。\n\
            {}\n\n\
            ## 補完ロジック:\n\
            1. すでに内容があるフィールドは変更しないでください。空文字またはnullを不足と見なします。\n\
            2. 指定された [MANDATORY] の形式を厳守してください。\n\
            3. {}\n\
            4. \"questionText\" を補完する場合、説明文やヒントを含めず、指定された形式（単語・文章等）のみを出力してください。\n\
            5. \"correctAnswers\" を補完する場合、**最も一般的・標準的な解答を先頭に配置**し、複数のバリエーションを積極的に含めてください。\"answerRubis\"（漢字の読みかな。アルファベット等は保持推奨）と \"distractors\" (3つ) も必ず生成してください。\n\
            6. \"recommendedMode\" (fourChoice, chips, text) も補完してください。\n\
            6. 解説 (\"descriptionText\") を作成する場合、[MANDATORY] Explanation Language があればそれに従い、なければ学習テーマや問題・正解の言語から最適な解説言語を推測してください。\n\n\
            ## 徹底禁止事項:\n\
            - 出力は生の JSON のみとしてください。",
            items_count,
            if format_rules.is_empty() {
                "適切なスタイルを使用してください。"
            } else {
                &format_rules
            },
            description_rule_jp
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
                            "answerRubis": { "type": "array", "items": { "type": "string" } },
                            "distractors": { "type": "array", "items": { "type": "string" } },
                            "recommendedMode": { "type": "string" },
                            "descriptionText": { "type": "string" }
                        },
                        "required": ["id", "questionText", "correctAnswers", "answerRubis", "distractors", "recommendedMode"]
                    }
                }
            }
        });

        let client = reqwest::Client::new();
        let response = client.post(&url).json(&payload).send().await.map_err(|e| {
            AppError::InternalServerError(format!("Failed to send request to Gemini: {}", e))
        })?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::InternalServerError(format!(
                "Gemini API error: {}",
                error_text
            )));
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
                AppError::InternalServerError(
                    "Failed to extract JSON string from AI response".to_string(),
                )
            })?;

        let questions: Vec<GeneratedQuestion> = serde_json::from_str(ai_text).map_err(|e| {
            AppError::InternalServerError(format!(
                "Failed to parse completed questions JSON: {}. Text: {}",
                e, ai_text
            ))
        })?;

        Ok(questions)
    }
}
