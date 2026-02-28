use crate::models::edit_request::EditRequest;
use sqlx::PgPool;
use uuid::Uuid;

pub struct EditRequestRepository;

impl EditRequestRepository {
    pub async fn create(
        pool: &PgPool,
        question_id: Uuid,
        requester_id: Uuid,
        question_text: String,
        correct_answers: Vec<String>,
        description_text: Option<String>,
        reason_id: i32,
    ) -> Result<EditRequest, sqlx::Error> {
        let request = sqlx::query_as::<_, EditRequest>(
            r#"
            WITH inserted AS (
                INSERT INTO edit_requests (question_id, requester_id, question_text, correct_answers, description_text, reason_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            )
            SELECT i.id, i.question_id, i.requester_id, u.username as requester_name, i.question_text, i.correct_answers, i.description_text, i.reason_id, i.status, i.created_at,
                   q.question_text as original_question_text, q.correct_answers as original_correct_answers, q.description_text as original_description_text,
                   c.name as collection_name
            FROM inserted i
            JOIN users u ON i.requester_id = u.id
            JOIN questions q ON i.question_id = q.id
            JOIN collections c ON q.collection_id = c.id
            "#,
        )
        .bind(question_id)
        .bind(requester_id)
        .bind(question_text)
        .bind(&correct_answers)
        .bind(description_text)
        .bind(reason_id)
        .fetch_one(pool)
        .await?;

        Ok(request)
    }

    pub async fn find_by_collection_id(
        pool: &PgPool,
        collection_id: Uuid,
    ) -> Result<Vec<EditRequest>, sqlx::Error> {
        let requests = sqlx::query_as::<_, EditRequest>(
            r#"
            SELECT er.id, er.question_id, er.requester_id, u.username as requester_name, er.question_text, er.correct_answers, er.description_text, er.reason_id, er.status, er.created_at,
                   q.question_text as original_question_text, q.correct_answers as original_correct_answers, q.description_text as original_description_text,
                   c.name as collection_name
            FROM edit_requests er
            JOIN questions q ON er.question_id = q.id
            JOIN collections c ON q.collection_id = c.id
            JOIN users u ON er.requester_id = u.id
            WHERE q.collection_id = $1
            ORDER BY er.created_at DESC
            "#,
        )
        .bind(collection_id)
        .fetch_all(pool)
        .await?;

        Ok(requests)
    }

    pub async fn find_by_owner_id(
        pool: &PgPool,
        owner_id: Uuid,
    ) -> Result<Vec<EditRequest>, sqlx::Error> {
        let requests = sqlx::query_as::<_, EditRequest>(
            r#"
            SELECT er.id, er.question_id, er.requester_id, u.username as requester_name, er.question_text, er.correct_answers, er.description_text, er.reason_id, er.status, er.created_at,
                   q.question_text as original_question_text, q.correct_answers as original_correct_answers, q.description_text as original_description_text,
                   c.name as collection_name
            FROM edit_requests er
            JOIN questions q ON er.question_id = q.id
            JOIN collections c ON q.collection_id = c.id
            JOIN users u ON er.requester_id = u.id
            WHERE c.user_id = $1 AND er.status = 'pending'
            ORDER BY er.created_at DESC
            "#,
        )
        .bind(owner_id)
        .fetch_all(pool)
        .await?;

        Ok(requests)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<EditRequest, sqlx::Error> {
        let request = sqlx::query_as::<_, EditRequest>(
            r#"
            SELECT er.id, er.question_id, er.requester_id, u.username as requester_name, er.question_text, er.correct_answers, er.description_text, er.reason_id, er.status, er.created_at,
                   q.question_text as original_question_text, q.correct_answers as original_correct_answers, q.description_text as original_description_text,
                   c.name as collection_name
            FROM edit_requests er
            JOIN questions q ON er.question_id = q.id
            JOIN collections c ON q.collection_id = c.id
            JOIN users u ON er.requester_id = u.id
            WHERE er.id = $1
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(request)
    }

    pub async fn update_status(
        pool: &PgPool,
        id: Uuid,
        status: String,
    ) -> Result<EditRequest, sqlx::Error> {
        let request = sqlx::query_as::<_, EditRequest>(
            r#"
            WITH updated AS (
                UPDATE edit_requests SET status = $1 WHERE id = $2 RETURNING *
            )
            SELECT i.id, i.question_id, i.requester_id, u.username as requester_name, i.question_text, i.correct_answers, i.description_text, i.reason_id, i.status, i.created_at,
                   q.question_text as original_question_text, q.correct_answers as original_correct_answers, q.description_text as original_description_text,
                   c.name as collection_name
            FROM updated i
            JOIN users u ON i.requester_id = u.id
            JOIN questions q ON i.question_id = q.id
            JOIN collections c ON q.collection_id = c.id
            "#,
        )
        .bind(status)
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(request)
    }
}
