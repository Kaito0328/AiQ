use crate::dtos::question_dto::UpsertQuestionItem;
use crate::error::AppError;
use csv::{ReaderBuilder, WriterBuilder};
use std::io::Cursor;

pub struct CsvService;

impl CsvService {
    /// CSVバイトデータをパースして、問題のリスト（UpsertQuestionItem）として返します。
    pub fn parse_csv(csv_data: &[u8]) -> Result<Vec<UpsertQuestionItem>, AppError> {
        let mut rdr = ReaderBuilder::new()
            .has_headers(true)
            .from_reader(Cursor::new(csv_data));
        
        let mut items = Vec::new();

        // ヘッダーを確認してインデックスを特定
        let headers = match rdr.headers() {
            Ok(h) => h,
            Err(e) => return Err(AppError::BadRequest(format!("CSV headers parsing failed: {}", e))),
        };

        let mut question_idx = None;
        let mut answer_idx = None;
        let mut desc_idx = None;

        for (i, header) in headers.iter().enumerate() {
            match header.to_lowercase().trim() {
                "question" | "question_text" | "問題文" => question_idx = Some(i),
                "answer" | "correct_answer" | "正解" => answer_idx = Some(i),
                "description" | "description_text" | "解説" => desc_idx = Some(i),
                _ => {}
            }
        }

        // デフォルト設定
        let question_idx = question_idx.unwrap_or(0);
        let answer_idx = answer_idx.unwrap_or(1);
        let desc_idx = desc_idx.unwrap_or(2);

        for result in rdr.records() {
            let record = match result {
                Ok(r) => r,
                Err(e) => return Err(AppError::BadRequest(format!("CSV record parsing failed: {}", e))),
            };

            if record.len() > question_idx && record.len() > answer_idx {
                let question_text = record.get(question_idx).unwrap_or("").trim().to_string();
                let correct_answers_str = record.get(answer_idx).unwrap_or("").trim();
                let correct_answers = correct_answers_str.split(';').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect::<Vec<_>>();
                let description_text = record.get(desc_idx).map(|s| s.trim().to_string());

                if !question_text.is_empty() && !correct_answers.is_empty() {
                    items.push(UpsertQuestionItem {
                        id: None,
                        question_text: Some(question_text),
                        correct_answers: Some(correct_answers),
                        description_text: if description_text.as_deref() == Some("") { None } else { description_text },
                    });
                }
            }
        }

        Ok(items)
    }

    /// 問題のリストをCSV文字列として生成します。
    pub fn generate_csv(questions: &[crate::models::question::Question]) -> Result<String, AppError> {
        let mut wtr = WriterBuilder::new().from_writer(vec![]);
        
        wtr.write_record(&["question", "answer", "description"]).map_err(|e| {
            AppError::InternalServerError(format!("Failed to write CSV headers: {}", e))
        })?;

        for q in questions {
            let answers_str = q.correct_answers.join(";");
            wtr.write_record(&[
                &q.question_text,
                &answers_str,
                q.description_text.as_deref().unwrap_or(""),
            ]).map_err(|e| {
                AppError::InternalServerError(format!("Failed to write CSV record: {}", e))
            })?;
        }

        let inner = wtr.into_inner().map_err(|e| {
            AppError::InternalServerError(format!("Failed to internalize CSV writer: {}", e))
        })?;

        String::from_utf8(inner).map_err(|e| {
            AppError::InternalServerError(format!("Failed to convert CSV to UTF-8: {}", e))
        })
    }
}
