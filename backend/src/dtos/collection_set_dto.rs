use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCollectionSetRequest {
    pub name: String,
    pub description_text: Option<String>,
    pub is_open: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCollectionSetRequest {
    pub name: String,
    pub description_text: Option<String>,
    pub is_open: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddCollectionToSetRequest {
    pub collection_id: Uuid,
    pub display_order: i32,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionSetResponse {
    pub set: crate::models::collection::CollectionSet,
    pub collections: Vec<crate::models::collection::Collection>,
}
