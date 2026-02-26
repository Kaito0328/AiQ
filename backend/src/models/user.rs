use chrono::{DateTime, Utc};
// src/models/user.rs
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub email: Option<String>,
    pub password: String,
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub icon_url: Option<String>,
    pub is_official: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

