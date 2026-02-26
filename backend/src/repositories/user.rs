use crate::dtos::user_dto::{UserProfileResponse, UserSearchQuery};
use crate::error::{AppError, Result};
use crate::models::user::User;
use sqlx::{PgPool, QueryBuilder};
use uuid::Uuid; // 追加: 共通のResultを読み込む

// 戻り値を Result<User, sqlx::Error> から Result<User> に変更
pub async fn create_user(pool: &PgPool, username: &str, hashed_password: &str) -> Result<User> {
    let mut tx = pool.begin().await?;

    let user = sqlx::query_file_as!(
        User,
        "src/queries/users/insert_user.sql",
        username,
        hashed_password
    )
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query_file!("src/queries/user_stats/insert_user_stats.sql", user.id)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(user)
}

pub async fn find_by_id(pool: &PgPool, user_id: Uuid) -> Result<Option<User>> {
    let user = sqlx::query_file_as!(User, "src/queries/users/find_by_id.sql", user_id)
        .fetch_optional(pool)
        .await?;

    Ok(user)
}

// こちらも Result<Option<User>> に変更
pub async fn find_by_username(pool: &PgPool, username: &str) -> Result<Option<User>> {
    let user = sqlx::query_file_as!(User, "src/queries/users/find_by_username.sql", username)
        .fetch_optional(pool)
        .await?;

    Ok(user)
}

pub async fn get_profile(
    pool: &PgPool,
    login_user_id: Option<Uuid>,
    target_user_id: Uuid,
) -> Result<Option<UserProfileResponse>> {
    let profile = sqlx::query_file_as!(
        UserProfileResponse,
        "src/queries/users/get_user_profile.sql",
        login_user_id,
        target_user_id
    )
    .fetch_optional(pool)
    .await?;

    Ok(profile)
}

pub async fn search_users(
    pool: &PgPool,
    current_user_id: Uuid,
    params: UserSearchQuery,
) -> Result<Vec<UserProfileResponse>> {
    // ベースとなるSQL
    let mut sql = QueryBuilder::new(
        r#"
        SELECT 
            u.id,
            u.username,
            u.display_name,
            u.bio,
            u.icon_url,
            COALESCE(s.follower_count, 0) as follower_count,
            COALESCE(s.following_count, 0) as following_count,
            (SELECT COUNT(*) FROM collections WHERE user_id = u.id) as collection_count,
            (SELECT COUNT(*) FROM collection_sets WHERE user_id = u.id) as set_count,
            EXISTS(SELECT 1 FROM user_follows WHERE follower_id = 
        "#,
    );
    // パラメータバインド ($1)
    sql.push_bind(current_user_id);
    sql.push(r#" AND followee_id = u.id) as is_following, "#);

    sql.push(r#" EXISTS(SELECT 1 FROM user_follows WHERE follower_id = u.id AND followee_id = "#);
    sql.push_bind(current_user_id); // ($2)
    sql.push(r#") as is_followed, "#);

    sql.push(r#" (u.id = "#);
    sql.push_bind(current_user_id); // ($3)
    sql.push(r#") as is_self, "#);

    sql.push(r#" u.is_official "#);

    sql.push(
        r#"
        FROM users u
        LEFT JOIN user_stats s ON u.id = s.user_id
        WHERE u.id != 
    "#,
    );
    sql.push_bind(current_user_id); // 自分自身は除外 ($4)

    // --- 検索条件 (q) ---
    if let Some(query) = &params.q
        && !query.is_empty()
    {
        sql.push(" AND u.username ILIKE "); // ILIKEは大文字小文字を区別しない検索
        sql.push_bind(format!("%{}%", query));
    }

    // --- ソート条件 (sort) ---
    sql.push(" ORDER BY ");
    match params.sort.as_deref() {
        Some("followers") => {
            // フォロワー数が多い順 -> 同じなら作成日順
            sql.push("s.follower_count DESC NULLS LAST, u.created_at DESC");
        }
        _ => {
            // デフォルトは登録が新しい順
            sql.push("u.created_at DESC");
        }
    }

    // --- ページネーション ---
    let limit = params.limit.unwrap_or(20);
    let offset = (params.page.unwrap_or(1).max(1) - 1) * limit;

    sql.push(" LIMIT ");
    sql.push_bind(limit);
    sql.push(" OFFSET ");
    sql.push_bind(offset);

    // 実行
    let users = sql
        .build_query_as::<UserProfileResponse>()
        .fetch_all(pool)
        .await?;

    Ok(users)
}

// src/repositories/user.rs の末尾に追記

pub async fn update_password(pool: &PgPool, user_id: Uuid, new_password_hash: &str) -> Result<()> {
    sqlx::query_file!(
        "src/queries/users/update_password.sql",
        new_password_hash,
        user_id
    )
    .execute(pool)
    .await?;

    Ok(())
}
pub async fn update_profile(
    pool: &PgPool,
    user_id: Uuid,
    username: Option<String>, // 追加
    display_name: Option<String>,
    bio: Option<String>,
    icon_url: Option<String>,
) -> Result<User> {
    // AppErrorを返すため Result<User> (crate::error::Result) を使用

    let res = sqlx::query_file_as!(
        User,
        "src/queries/users/update_profile.sql",
        username,
        display_name,
        bio,
        icon_url,
        user_id
    )
    .fetch_one(pool)
    .await;

    match res {
        Ok(user) => Ok(user),
        Err(sqlx::Error::Database(db_err)) => {
            // PostgreSQLのエラーコード 23505 は unique_violation (重複) です
            if db_err.code().as_deref() == Some("23505") {
                return Err(AppError::DuplicateUser);
            }
            Err(sqlx::Error::Database(db_err).into())
        }
        Err(e) => Err(e.into()),
    }
}
