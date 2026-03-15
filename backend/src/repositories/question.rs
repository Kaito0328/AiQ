use crate::models::question::Question;
use crate::dtos::quiz_dto::{FilterNode, FilterCondition};
use sqlx::PgPool;
use uuid::Uuid;

pub struct QuestionRepository;

impl QuestionRepository {
    pub async fn create(
        pool: &PgPool,
        collection_id: Uuid,
        question_text: String,
        correct_answers: Vec<String>,
        answer_rubis: Vec<String>,
        distractors: Vec<String>,
        chip_answer: Option<String>,
        is_selection_only: bool,
        description_text: Option<String>,
    ) -> Result<Question, sqlx::Error> {
        let question = sqlx::query_as!(
            Question,
            r#"
            INSERT INTO questions (id, collection_id, question_text, correct_answers, answer_rubis, distractors, chip_answer, is_selection_only, description_text, created_at, updated_at)
            VALUES (gen_random_uuid(), $1::uuid, $2::text, $3::text[], $4::text[], $5::text[], $6::text, $7::boolean, $8::text, NOW(), NOW())
            RETURNING id, collection_id, question_text, correct_answers as "correct_answers: Vec<String>", answer_rubis as "answer_rubis: Vec<String>", distractors as "distractors: Vec<String>", chip_answer, is_selection_only, description_text, created_at, updated_at
            "#,
            collection_id,
            question_text,
            &correct_answers,
            &answer_rubis,
            &distractors,
            chip_answer,
            is_selection_only,
            description_text
        )
        .fetch_one(pool)
        .await?;

        Ok(question)
    }

    pub async fn find_by_id(pool: &PgPool, question_id: Uuid) -> Result<Question, sqlx::Error> {
        let question = sqlx::query_as!(
            Question,
            r#"
            SELECT id, collection_id, question_text, correct_answers as "correct_answers: Vec<String>", answer_rubis as "answer_rubis: Vec<String>", distractors as "distractors: Vec<String>", chip_answer, is_selection_only, description_text, created_at, updated_at
            FROM questions
            WHERE id = $1::uuid
            "#,
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
        let questions = sqlx::query_as!(
            Question,
            r#"
            SELECT id, collection_id, question_text, correct_answers as "correct_answers: Vec<String>", answer_rubis as "answer_rubis: Vec<String>", distractors as "distractors: Vec<String>", chip_answer, is_selection_only, description_text, created_at, updated_at
            FROM questions
            WHERE collection_id = $1::uuid
            ORDER BY created_at ASC, id ASC
            "#,
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
        answer_rubis: Vec<String>,
        distractors: Vec<String>,
        chip_answer: Option<String>,
        is_selection_only: bool,
        description_text: Option<String>,
    ) -> Result<Question, sqlx::Error> {
        let question = sqlx::query_as!(
            Question,
            r#"
            UPDATE questions SET
                question_text = $1::text,
                correct_answers = $2::text[],
                answer_rubis = $3::text[],
                distractors = $4::text[],
                chip_answer = $5::text,
                is_selection_only = $6::boolean,
                description_text = $7::text,
                updated_at = NOW()
            WHERE id = $8::uuid
            RETURNING id, collection_id, question_text, correct_answers as "correct_answers: Vec<String>", answer_rubis as "answer_rubis: Vec<String>", distractors as "distractors: Vec<String>", chip_answer, is_selection_only, description_text, created_at, updated_at
            "#,
            question_text,
            &correct_answers,
            &answer_rubis,
            &distractors,
            chip_answer,
            is_selection_only,
            description_text,
            question_id
        )
        .fetch_one(pool)
        .await?;

        Ok(question)
    }

    pub async fn delete(pool: &PgPool, question_id: Uuid) -> Result<bool, sqlx::Error> {
        let result = sqlx::query!("DELETE FROM questions WHERE id = $1::uuid", question_id)
            .execute(pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn batch_upsert(
        pool: &PgPool,
        collection_id: Uuid,
        items: Vec<crate::dtos::question_dto::UpsertQuestionItem>,
    ) -> Result<Vec<Question>, sqlx::Error> {
        let mut results = Vec::new();

        for item in items {
            let id = item.id.unwrap_or_else(Uuid::new_v4);
            let question_text = item
                .question_text
                .unwrap_or_else(|| "新しい問題".to_string());
            let correct_answers: Vec<String> = item.correct_answers.unwrap_or_default();
            let answer_rubis: Vec<String> = item.answer_rubis.unwrap_or_default();
            let distractors: Vec<String> = item.distractors.unwrap_or_default();

            let row = sqlx::query_file_as!(
                Question,
                "src/queries/questions/upsert_question.sql",
                id,
                collection_id,
                question_text,
                &correct_answers as &[String],
                &answer_rubis as &[String],
                &distractors as &[String],
                item.chip_answer,
                item.is_selection_only.unwrap_or(false),
                item.description_text
            )
            .fetch_one(pool)
            .await?;

            results.push(row);
        }

        Ok(results)
    }

    pub async fn batch_delete(pool: &PgPool, question_ids: Vec<Uuid>) -> Result<u64, sqlx::Error> {
        if question_ids.is_empty() {
            return Ok(0);
        }

        let result = sqlx::query_file!(
            "src/queries/questions/delete_questions_by_ids.sql",
            &question_ids
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }

    pub async fn find_filtered_questions(
        pool: &PgPool,
        collection_ids: &[Uuid],
        user_id_opt: Option<Uuid>,
        filter_node: Option<&FilterNode>,
        sorts: &[crate::dtos::quiz_dto::SortCondition],
    ) -> Result<Vec<Question>, sqlx::Error> {
        if collection_ids.is_empty() {
            return Ok(Vec::new());
        }

        let mut builder = sqlx::QueryBuilder::new(
            r#"
            SELECT q.id, q.collection_id, q.question_text, 
                   q.correct_answers, 
                   q.answer_rubis, 
                   q.distractors, 
                   q.chip_answer, q.is_selection_only, q.description_text, 
                   q.created_at, q.updated_at
            FROM questions q
            "#,
        );

        let needs_stats = filter_node.is_some() || sorts.iter().any(|s| s.key == "WRONG" || s.key == "ACCURACY");
        
        if user_id_opt.is_some() && needs_stats {
            builder.push(" LEFT JOIN user_question_stats uqs ON q.id = uqs.question_id AND uqs.user_id = ");
            builder.push_bind(user_id_opt.unwrap());
        }

        builder.push(" WHERE q.collection_id = ANY(");
        builder.push_bind(collection_ids);
        builder.push(") ");

        if let (Some(_), Some(node)) = (user_id_opt, filter_node) {
            builder.push(" AND (");
            Self::build_filter_sql(&mut builder, node);
            builder.push(") ");
        }

        if !sorts.is_empty() {
            let mut order_clauses = Vec::new();

            for sort in sorts {
                let dir = if sort.direction.as_deref() == Some("DESC") { "DESC" } else { "ASC" };
                match sort.key.as_str() {
                    "WRONG" => {
                        let clause = format!("COALESCE(uqs.wrong_count, 0) {}", dir);
                        order_clauses.push(clause);
                    }
                    "ACCURACY" => {
                        let clause = format!(
                            "CASE 
                                WHEN COALESCE(uqs.correct_count, 0) + COALESCE(uqs.wrong_count, 0) = 0 THEN 0.0 
                                ELSE CAST(COALESCE(uqs.correct_count, 0) AS FLOAT) / (COALESCE(uqs.correct_count, 0) + COALESCE(uqs.wrong_count, 0)) 
                            END {}", dir
                        );
                        order_clauses.push(clause);
                    }
                    "ID" => {
                        let clause = format!("q.id {}", dir);
                        order_clauses.push(clause);
                    }
                    "RANDOM" => {
                        order_clauses.push("RANDOM()".to_string());
                    }
                    _ => {}
                }
            }

            if !order_clauses.is_empty() {
                builder.push(" ORDER BY ");
                builder.push(order_clauses.join(", "));
            }
        }

        let query = builder.build_query_as::<Question>();
        query.fetch_all(pool).await
    }

    fn build_filter_sql(builder: &mut sqlx::QueryBuilder<'_, sqlx::Postgres>, node: &FilterNode) {
        match node {
            FilterNode::And { conditions } => {
                if conditions.is_empty() {
                    builder.push(" true ");
                    return;
                }
                builder.push("(");
                for (i, cond) in conditions.iter().enumerate() {
                    if i > 0 {
                        builder.push(" AND ");
                    }
                    Self::build_filter_sql(builder, cond);
                }
                builder.push(")");
            }
            FilterNode::Or { conditions } => {
                if conditions.is_empty() {
                    builder.push(" false ");
                    return;
                }
                builder.push("(");
                for (i, cond) in conditions.iter().enumerate() {
                    if i > 0 {
                        builder.push(" OR ");
                    }
                    Self::build_filter_sql(builder, cond);
                }
                builder.push(")");
            }
            FilterNode::Condition { condition } => match condition.filter_type.as_str() {
                "NOT_SOLVED" => {
                    builder.push(" (uqs.correct_count IS NULL OR uqs.correct_count = 0) ");
                }
                "NOT_LEARNED" => {
                    builder.push(" (uqs.correct_count IS NULL AND uqs.wrong_count IS NULL) ");
                }
                "WRONG_COUNT" => {
                    let val = condition.value.unwrap_or(0);
                    builder.push(" COALESCE(uqs.wrong_count, 0) >= ");
                    builder.push_bind(val);
                }
                _ => {
                    builder.push(" true ");
                }
            },
        }
    }
}
