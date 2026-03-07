pub mod collection;
pub mod edit_request;
pub mod question;
pub mod quiz;
pub mod ranking_quiz;
pub mod user;

use serde::Deserialize;

#[derive(Deserialize)]
pub struct Pagination {
    pub page: Option<i64>,
    pub limit: Option<i64>,
}
