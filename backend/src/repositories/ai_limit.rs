use crate::error::Result;
use sqlx::{PgPool, types::chrono::{DateTime, Utc}};
use uuid::Uuid;

pub struct UserAiLimit {
    pub user_id: Uuid,
    pub units_used: f32,
    pub last_reset_at: DateTime<Utc>,
}

pub async fn find_by_user_id(pool: &PgPool, user_id: Uuid) -> Result<Option<UserAiLimit>> {
    let limit = sqlx::query_as!(
        UserAiLimit,
        r#"
        SELECT user_id, units_used, last_reset_at
        FROM user_ai_limits
        WHERE user_id = $1
        "#,
        user_id
    )
    .fetch_optional(pool)
    .await?;

    Ok(limit)
}

pub async fn upsert(
    pool: &PgPool,
    user_id: Uuid,
    units_used: f32,
    last_reset_at: DateTime<Utc>,
) -> Result<()> {
    sqlx::query!(
        r#"
        INSERT INTO user_ai_limits (user_id, units_used, last_reset_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE
        SET units_used = EXCLUDED.units_used,
            last_reset_at = EXCLUDED.last_reset_at
        "#,
        user_id,
        units_used,
        last_reset_at
    )
    .execute(pool)
    .await?;

    Ok(())
}
