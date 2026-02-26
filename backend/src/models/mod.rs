pub mod collection;
pub mod question;
pub mod ranking_quiz;
pub mod quiz;
pub mod user;

use serde::Deserialize;

#[derive(Deserialize)]
pub struct Pagination {
    pub page: Option<i64>,
    pub limit: Option<i64>,
}
