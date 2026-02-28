use crate::models::question::Question;
use sqlx::PgPool;
use uuid::Uuid;

pub struct QuestionRepository;

impl QuestionRepository {
    pub async fn create(
        pool: &PgPool,
        collection_id: Uuid,
        question_text: String,
        correct_answers: Vec<String>,
        description_text: Option<String>,
    ) -> Result<Question, sqlx::Error> {
        let question = sqlx::query_file_as!(
            Question,
            "src/queries/questions/insert_question.sql",
            collection_id,
            question_text,
            &correct_answers,
            description_text
        )
        .fetch_one(pool)
        .await?;

        Ok(question)
    }

    pub async fn find_by_id(pool: &PgPool, question_id: Uuid) -> Result<Question, sqlx::Error> {
        let question = sqlx::query_file_as!(
            Question,
            "src/queries/questions/find_by_id.sql",
            question_id
        )
        .fetch_one(pool)
        .await?;

        Ok(question)
    }

    pub async fn find_by_collection_id(
        pool: &PgPool,
        collection_id: Uuid,
    ) -> Result<Vec<Question>, sqlx::Error> {
        let questions = sqlx::query_file_as!(
            Question,
            "src/queries/questions/find_by_collection_id.sql",
            collection_id
        )
        .fetch_all(pool)
        .await?;

        Ok(questions)
    }

    pub async fn update(
        pool: &PgPool,
        question_id: Uuid,
        question_text: String,
        correct_answers: Vec<String>,
        description_text: Option<String>,
    ) -> Result<Question, sqlx::Error> {
        let question = sqlx::query_file_as!(
            Question,
            "src/queries/questions/update_question.sql",
            question_text,
            &correct_answers,
            description_text,
            question_id
        )
        .fetch_one(pool)
        .await?;

        Ok(question)
    }

    pub async fn delete(pool: &PgPool, question_id: Uuid) -> Result<bool, sqlx::Error> {
        let result = sqlx::query_file!("src/queries/questions/delete_question.sql", question_id)
            .execute(pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn batch_upsert(
        pool: &PgPool,
        collection_id: Uuid,
        items: Vec<crate::dtos::question_dto::UpsertQuestionItem>,
    ) -> Result<Vec<Question>, sqlx::Error> {
        if items.is_empty() {
            return Ok(Vec::new());
        }

        let mut ids = Vec::new();
        let mut coll_ids = Vec::new();
        let mut texts: Vec<Option<String>> = Vec::new();
        let mut answers: Vec<Option<String>> = Vec::new();
        let mut descriptions: Vec<Option<String>> = Vec::new();

        for item in items {
            let is_new = item.id.is_none();
            ids.push(item.id.unwrap_or_else(Uuid::new_v4));
            coll_ids.push(collection_id);

            texts.push(item.question_text.or_else(|| {
                if is_new {
                    Some("新しい問題".to_string())
                } else {
                    None
                }
            }));
            answers.push(item.correct_answers.map(|v| v.join(";")).or_else(|| {
                if is_new {
                    Some("".to_string())
                } else {
                    None
                }
            }));
            descriptions.push(item.description_text);
        }

        let results = sqlx::query_as!(
            Question,
            r#"
            INSERT INTO questions (id, collection_id, question_text, correct_answers, description_text)
            SELECT u.id, u.collection_id, u.question_text, 
                   CASE WHEN u.correct_answers_raw IS NULL THEN NULL ELSE string_to_array(u.correct_answers_raw, ';') END as correct_answers, 
                   u.description_text
            FROM UNNEST($1::uuid[], $2::uuid[], $3::text[], $4::text[], $5::text[]) 
            AS u(id, collection_id, question_text, correct_answers_raw, description_text)
            ON CONFLICT (id) DO UPDATE SET
                question_text = COALESCE(EXCLUDED.question_text, questions.question_text),
                correct_answers = COALESCE(EXCLUDED.correct_answers, questions.correct_answers),
                description_text = COALESCE(EXCLUDED.description_text, questions.description_text),
                updated_at = NOW()
            RETURNING id, collection_id, question_text, correct_answers, description_text, created_at, updated_at
            "#,
            &ids,
            &coll_ids,
            &texts as &[Option<String>],
            &answers as &[Option<String>],
            &descriptions as &[Option<String>]
        )
        .fetch_all(pool)
        .await?;

        Ok(results)
    }

    pub async fn batch_delete(
        pool: &PgPool,
        question_ids: Vec<Uuid>,
    ) -> Result<u64, sqlx::Error> {
        if question_ids.is_empty() {
            return Ok(0);
        }

        let result = sqlx::query!(
            "DELETE FROM questions WHERE id = ANY($1)",
            &question_ids
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }
}
