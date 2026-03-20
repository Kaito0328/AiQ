use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCollectionRequest {
    pub name: String,
    pub description_text: Option<String>,
    pub is_open: bool,
    pub default_mode: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCollectionRequest {
    pub name: String,
    pub description_text: Option<String>,
    pub is_open: bool,
    pub default_mode: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertCollectionSearchMetadataRequest {
    pub difficulty_level: Option<i16>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertCollectionItem {
    pub id: Option<uuid::Uuid>,
    pub name: Option<String>,
    pub description_text: Option<String>,
    pub is_open: Option<bool>,
    pub default_mode: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchCollectionsRequest {
    pub upsert_items: Vec<UpsertCollectionItem>,
    pub delete_ids: Vec<uuid::Uuid>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionResponse {
    pub id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub name: String,
    pub description_text: Option<String>,
    pub is_open: bool,
    pub default_mode: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub author_name: Option<String>,
    pub author_icon_url: Option<String>,
    pub is_official: bool,
    pub favorite_count: Option<i64>,
    pub question_count: Option<i64>,
    pub is_favorited: bool,
    pub user_rank: Option<i64>,
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct CollectionSearchResponse {
    pub id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub name: String,
    pub description_text: Option<String>,
    pub is_open: bool,
    pub default_mode: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub author_name: Option<String>,
    pub author_icon_url: Option<String>,
    pub is_official: bool,
    pub favorite_count: Option<i64>,
    pub question_count: Option<i64>,
    pub is_favorited: bool,
    pub user_rank: Option<i64>,
    pub difficulty_level: i16,
    pub tags: Vec<String>,
}

#[derive(Debug, serde::Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct PopularTagResponse {
    pub tag: String,
    pub count: i64,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LeaderboardEntry {
    pub user_id: uuid::Uuid,
    pub username: String,
    pub icon_url: Option<String>,
    pub score: i32,
    pub rank: i64,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LeaderboardResponse {
    pub collection_id: uuid::Uuid,
    pub entries: Vec<LeaderboardEntry>,
}
