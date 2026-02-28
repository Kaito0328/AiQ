use axum::{
    extract::{FromRequestParts, Path},
    http::{StatusCode, request::Parts},
};

use crate::{models::user::User, state::AppState};
use std::collections::HashMap;

impl FromRequestParts<AppState> for User {
    type Rejection = StatusCode;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        // Path<HashMap<String, String>> としてすべてのパラメータを受け取る
        let Path(params): Path<HashMap<String, String>> = Path::from_request_parts(parts, state)
            .await
            .map_err(|e| {
                eprintln!("Failed to parse path params: {:?}", e);
                StatusCode::BAD_REQUEST
            })?;

        // "user_id" というキーの値を取り出す
        let user_id_or_username = params.get("user_id").ok_or_else(|| {
            eprintln!("Missing 'user_id' parameter in path");
            StatusCode::BAD_REQUEST
        })?;

        // 1. UUID としてパースを試みる
        if let Ok(user_id) = uuid::Uuid::parse_str(user_id_or_username) {
            let user_opt = sqlx::query_as::<_, User>(
                r#"
                SELECT id, username, email, password, display_name, bio, icon_url, is_official, created_at, updated_at
                FROM users WHERE id = $1
                "#,
            )
            .bind(user_id)
            .fetch_optional(&state.db)
            .await
            .map_err(|e| {
                eprintln!("Database error during UUID lookup: {:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            if let Some(user) = user_opt {
                return Ok(user);
            }
        }

        // 2. UUID でない、または見つからない場合はユーザー名として検索
        let user_opt = sqlx::query_as::<_, User>(
            r#"
            SELECT id, username, email, password, display_name, bio, icon_url, is_official, created_at, updated_at
            FROM users WHERE username = $1
            "#,
        )
        .bind(user_id_or_username)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| {
            eprintln!("Database error during username lookup: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        match user_opt {
            Some(user) => Ok(user),
            None => {
                println!("User not found: {}", user_id_or_username);
                Err(StatusCode::NOT_FOUND)
            }
        }
    }
}
