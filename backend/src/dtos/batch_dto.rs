use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FailedCreateItem {
    pub index: usize,
    pub errors: Vec<String>, // Simplification for now, or match specific error type
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FailedUpdateItem {
    pub id: Uuid,
    pub errors: Vec<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchUpsertResponse<T> {
    pub success_items: Vec<T>,
    pub failed_create_items: Vec<FailedCreateItem>,
    pub failed_update_items: Vec<FailedUpdateItem>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchDeleteResponse<T> {
    pub success_items: Vec<T>,
    pub failed_items: Vec<FailedUpdateItem>,
}
