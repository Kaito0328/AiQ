use sqlx::PgPool;
use crate::models::user::User;

pub async fn create_user(
    pool: &PgPool,
    username: &str,
    hashed_password: &str,
) -> Result<User, sqlx::Error> {
    let mut tx = pool.begin().await?;

    let user = sqlx::query_file_as!(
        User,
        "src/repositories/user/queries/insert_user.sql",
        username,
        hashed_password
    )
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query_file!(
        "src/repositories/user/queries/insert_user_stats.sql",
        user.id
    )
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(user)
}

pub async fn find_by_username(
    pool: &PgPool,
    username: &str,
) -> Result<Option<User>, sqlx::Error> {
    let user = sqlx::query_file_as!(
        User,
        "src/repositories/user/queries/find_by_username.sql",
        username
    )
    .fetch_optional(pool)
    .await?;

    Ok(user)
}