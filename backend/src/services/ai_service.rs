use crate::dtos::ai_dto::GeneratedQuestion;
use crate::error::AppError;
use reqwest::Client;
use serde_json::json;
use std::env;

pub struct AiService;

impl AiService {
    pub async fn generate_questions(
        pool: &sqlx::PgPool,
        user_id: uuid::Uuid,
        prompt: &str,
        count: i32,
        pdf_data: Option<&str>,
        pdf_page_count: Option<i32>,
        question_format: Option<&str>,
        answer_format: Option<&str>,
        example_question: Option<&str>,
        example_answer: Option<&str>,
        explanation_language: Option<&str>,
    ) -> Result<Vec<GeneratedQuestion>, AppError> {
        // ユニット消費の計算
        let mut units = 1.0; // 基本コスト
        units += count as f32 * 0.2; // 問題数コスト
        if pdf_data.is_some() {
            units += pdf_page_count.unwrap_or(1) as f32 * 0.5; // PDFページコスト
        }

        // 制限チェック
        crate::services::ai_limit_service::AiLimitService::check_and_consume(pool, user_id, units)
            .await?;

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
           - 漢字を一切含まない場合は空文字 (\"\")。\n\
        4. \"chipAnswer\": チップ形式（ボタン選択式）の解答に使用する短いラベル。\n\
           - 漢字を一切含まず、数字、ひらがな、カタカナ、アルファベットのみで構成してください。\n\
           - 解答（correctAnswers[0]）に漢字が含まれる場合、その漢字部分のみを読みかなに変換してください。漢字以外（数字、英単語、記号等）は【そのまま】維持してください。\n\
           - 例：'3600秒' -> '360びょう'（または3600）, 'CPU（中央演算処理装置）' -> 'CPU', '織田信長' -> 'おだのぶなが'。\n\
        5. \"distractors\": 誤答を正確に 3 つ。正解とは明確に異なる一貫した難易度のものを作成してください。\n\
        6. \"isSelectionOnly\": 4択問題としてのみ成立するかどうかのフラグ（true/false）。\n\
           - 「ふさわしくないものはどれ？」「誤っているものはどれ？」といった、選択肢がないと成立しない問題、あるいは選択肢から推測させるのが適切な問題の場合は true にしてください。\n\
           - それ以外（直接的な想起が可能な固有名詞や事実など）は false にしてください。\n\
        7. \"descriptionText\": 解説。\n\
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
                            "chipAnswer": { "type": "string" },
                            "distractors": { "type": "array", "items": { "type": "string" } },
                            "isSelectionOnly": { "type": "boolean" },
                            "descriptionText": { "type": "string" }
                        },
                        "required": ["questionText", "correctAnswers", "answerRubis", "chipAnswer", "distractors", "isSelectionOnly"]
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
        pool: &sqlx::PgPool,
        user_id: uuid::Uuid,
        items: Vec<crate::dtos::ai_dto::PartialQuestion>,
        complete_description: bool,
        question_format: Option<String>,
        answer_format: Option<String>,
        explanation_language: Option<String>,
    ) -> Result<Vec<GeneratedQuestion>, AppError> {
        // ユニット消費の計算
        let units = 1.0 + (items.len() as f32 * 0.1); // 補完は基本コスト + 件数*0.1

        // 制限チェック
        crate::services::ai_limit_service::AiLimitService::check_and_consume(pool, user_id, units)
            .await?;

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
            5. \"correctAnswers\" を補完する場合、**最も一般的・標準的な解答を先頭に配置**し、複数のバリエーションを積極的に含めてください。\"answerRubis\"（漢字の読みかな）、\"chipAnswer\"（漢字を含まない短いラベル。数字や英語は保持）、\"distractors\" (3つ) も必ず生成してください。\n\
            6. \"isSelectionOnly\" (boolean) も補完してください。「どれ？」を含む問題などは true にしてください。\n\
            7. 解説 (\"descriptionText\") を作成する場合、[MANDATORY] Explanation Language があればそれに従い、なければ学習テーマや問題・正解の言語から最適な解説言語を推測してください。\n\n\
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
                            "chipAnswer": { "type": "string" },
                            "distractors": { "type": "array", "items": { "type": "string" } },
                            "isSelectionOnly": { "type": "boolean" },
                            "descriptionText": { "type": "string" }
                        },
                        "required": ["id", "questionText", "correctAnswers", "answerRubis", "chipAnswer", "distractors", "isSelectionOnly"]
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
