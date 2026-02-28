use sqlx::PgPool;
use uuid::Uuid;
use crate::models::edit_request::EditRequest;
use crate::repositories::edit_request::EditRequestRepository;
use crate::dtos::edit_request_dto::{CreateEditRequest, EditRequestResponse};
use crate::error::AppError;

pub struct EditRequestService;

impl EditRequestService {
    pub async fn create_request(
        pool: &PgPool,
        requester_id: Uuid,
        req: CreateEditRequest,
    ) -> Result<EditRequestResponse, AppError> {
        let request = EditRequestRepository::create(
            pool,
            req.question_id,
            requester_id,
            req.question_text,
            req.correct_answers,
            req.description_text,
            req.reason_id,
        )
        .await
        .map_err(|e| AppError::InternalServerError(format!("Failed to create edit request: {}", e)))?;

        Ok(Self::map_to_response(request))
    }

    pub async fn list_by_collection(
        pool: &PgPool,
        collection_id: Uuid,
    ) -> Result<Vec<EditRequestResponse>, AppError> {
        let requests = EditRequestRepository::find_by_collection_id(pool, collection_id)
            .await
            .map_err(|e| AppError::InternalServerError(format!("Failed to list edit requests: {}", e)))?;

        Ok(requests.into_iter().map(|r| Self::map_to_response(r)).collect())
    }

    pub async fn list_by_owner(
        pool: &PgPool,
        owner_id: Uuid,
    ) -> Result<Vec<EditRequestResponse>, AppError> {
        let requests = EditRequestRepository::find_by_owner_id(pool, owner_id)
            .await
            .map_err(|e| AppError::InternalServerError(format!("Failed to list owner edit requests: {}", e)))?;

        Ok(requests.into_iter().map(|r| Self::map_to_response(r)).collect())
    }

    pub async fn update_status(
        pool: &PgPool,
        id: Uuid,
        status: String,
    ) -> Result<EditRequestResponse, AppError> {
        let request = EditRequestRepository::update_status(pool, id, status)
            .await
            .map_err(|e| AppError::InternalServerError(format!("Failed to update edit request status: {}", e)))?;

        Ok(Self::map_to_response(request))
    }

    fn map_to_response(er: EditRequest) -> EditRequestResponse {
        EditRequestResponse {
            id: er.id,
            question_id: er.question_id,
            requester_id: er.requester_id,
            requester_name: er.requester_name,
            question_text: er.question_text,
            correct_answers: er.correct_answers,
            description_text: er.description_text,
            reason_id: er.reason_id,
            status: er.status,
            created_at: er.created_at,
            original_question_text: er.original_question_text,
            original_correct_answers: er.original_correct_answers,
            original_description_text: er.original_description_text,
            collection_name: er.collection_name,
        }
    }
}
