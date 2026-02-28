use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct UserProfileResponse {
    pub id: Uuid,
    pub username: String,
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub icon_url: Option<String>,
    pub follower_count: i64,
    pub following_count: i64,
    pub collection_count: i64,
    pub set_count: i64,
    pub is_following: bool, // 自分が相手をフォローしているか
    pub is_followed: bool,  // 相手が自分をフォローしているか
    pub is_self: bool,      // 自分自身のプロフィールか
    pub is_official: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserSearchQuery {
    // 🌟 flattenをやめて、直接フィールドを書きます
    // これなら ?page=1&limit=20&q=keyword を確実に受け取れます
    pub page: Option<i64>,
    pub limit: Option<i64>,

    pub q: Option<String>,
    pub sort: Option<String>,
}

// src/dtos/user.rs の末尾に追記

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChangePasswordRequest {
    pub old_password: String,
    pub new_password: String,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateProfileRequest {
    pub username: Option<String>,
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub icon_url: Option<String>,
}
