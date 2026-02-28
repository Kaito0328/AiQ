pub mod auth_dto;
pub mod batch_dto;
pub mod collection_dto;
pub mod collection_set_dto;
pub mod question_dto;
pub mod ranking_quiz_dto;
pub mod quiz_dto;
pub mod user_dto;
pub mod ai_dto;
pub mod match_dto;
pub mod match_ws_dto;
pub mod edit_request_dto;

// src/dtos/common.rs
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Pagination {
    pub page: Option<i64>,
    pub limit: Option<i64>,
}
