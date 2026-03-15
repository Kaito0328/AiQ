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
        answer_rubis: Vec<String>,
        distractors: Vec<String>,
        chip_answer: Option<String>,
        is_selection_only: bool,
        description_text: Option<String>,
        reason_id: i32,
    ) -> Result<EditRequest, sqlx::Error> {
        let request = sqlx::query_file_as!(
            EditRequest,
            "src/queries/edit_requests/insert_edit_request.sql",
            question_id,
            requester_id,
            question_text,
            &correct_answers,
            &answer_rubis,
            &distractors,
            chip_answer,
            is_selection_only,
            description_text,
            reason_id
        )
        .fetch_one(pool)
        .await?;

        Ok(request)
    }

    pub async fn find_by_collection_id(
        pool: &PgPool,
        collection_id: Uuid,
    ) -> Result<Vec<EditRequest>, sqlx::Error> {
        let requests = sqlx::query_file_as!(
            EditRequest,
            "src/queries/edit_requests/find_by_collection_id.sql",
            collection_id
        )
        .fetch_all(pool)
        .await?;

        Ok(requests)
    }

    pub async fn find_by_owner_id(
        pool: &PgPool,
        owner_id: Uuid,
    ) -> Result<Vec<EditRequest>, sqlx::Error> {
        let requests = sqlx::query_file_as!(
            EditRequest,
            "src/queries/edit_requests/find_by_owner_id.sql",
            owner_id
        )
        .fetch_all(pool)
        .await?;

        Ok(requests)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<EditRequest, sqlx::Error> {
        let request =
            sqlx::query_file_as!(EditRequest, "src/queries/edit_requests/find_by_id.sql", id)
                .fetch_one(pool)
                .await?;

        Ok(request)
    }

    pub async fn update_status(
        pool: &PgPool,
        id: Uuid,
        status: String,
    ) -> Result<EditRequest, sqlx::Error> {
        let request = sqlx::query_file_as!(
            EditRequest,
            "src/queries/edit_requests/update_status.sql",
            status,
            id
        )
        .fetch_one(pool)
        .await?;

        Ok(request)
    }
}
