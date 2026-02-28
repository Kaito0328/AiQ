use crate::error::Result;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn follow_user(pool: &PgPool, follower_id: Uuid, followee_id: Uuid) -> Result<()> {
    // トランザクションを開始します
    let mut tx = pool.begin().await?;

    // 1. フォロー関係をテーブルに記録します
    // ON CONFLICT DO NOTHING は, すでにフォロー関係が存在する場合はエラーにせず無視するというSQLの命令です
    let result = sqlx::query(include_str!("../queries/user_follows/insert_follow.sql"))
        .bind(follower_id)
        .bind(followee_id)
        .execute(&mut *tx)
        .await?;

    // 実際にレコードが追加された件数を確認します
    // もしすでにフォロー済みで無視された場合は 0 になるため, カウントアップをせずに終了します
    if result.rows_affected() == 0 {
        return Ok(());
    }

    // 2. フォローした側(自分)の following_count を +1 します
    sqlx::query(include_str!("../queries/user_stats/increment_following.sql"))
        .bind(follower_id)
        .execute(&mut *tx)
        .await?;

    // 3. フォローされた側(相手)の follower_count を +1 します
    sqlx::query(include_str!("../queries/user_stats/increment_follower.sql"))
        .bind(followee_id)
        .execute(&mut *tx)
        .await?;

    // 全ての処理が成功したので, 変更をデータベースに確定させます
    tx.commit().await?;

    Ok(())
}

pub async fn unfollow_user(pool: &PgPool, follower_id: Uuid, followee_id: Uuid) -> Result<()> {
    // トランザクションを開始します
    let mut tx = pool.begin().await?;

    // 1. フォロー関係をテーブルから削除します
    let result = sqlx::query(include_str!("../queries/user_follows/delete_follow.sql"))
        .bind(follower_id)
        .bind(followee_id)
        .execute(&mut *tx)
        .await?;

    // 実際にレコードが削除された件数を確認します
    // もし元々フォローしていなかった場合は 0 になるため、カウントを減らさずに終了します
    if result.rows_affected() == 0 {
        return Ok(());
    }

    // 2. フォローしていた側(自分)の following_count を -1 します
    sqlx::query(include_str!("../queries/user_stats/decrement_following.sql"))
        .bind(follower_id)
        .execute(&mut *tx)
        .await?;

    // 3. フォローされていた側(相手)の follower_count を -1 します
    sqlx::query(include_str!("../queries/user_stats/decrement_follower.sql"))
        .bind(followee_id)
        .execute(&mut *tx)
        .await?;

    // 全ての処理が成功したので、変更をデータベースに確定させます
    tx.commit().await?;

    Ok(())
}

pub async fn get_followers(
    pool: &PgPool,
    login_user_id: Option<Uuid>,
    target_user_id: Uuid,
) -> Result<Vec<crate::dtos::user_dto::UserProfileResponse>> {
    let users = sqlx::query_as::<_, crate::dtos::user_dto::UserProfileResponse>(
        include_str!("../queries/user_follows/get_followers.sql")
    )
    .bind(login_user_id)
    .bind(target_user_id)
    .fetch_all(pool)
    .await?;

    Ok(users)
}

pub async fn get_followees(
    pool: &PgPool,
    login_user_id: Option<Uuid>,
    target_user_id: Uuid,
) -> Result<Vec<crate::dtos::user_dto::UserProfileResponse>> {
    let users = sqlx::query_as::<_, crate::dtos::user_dto::UserProfileResponse>(
        include_str!("../queries/user_follows/get_followees.sql")
    )
    .bind(login_user_id)
    .bind(target_user_id)
    .fetch_all(pool)
    .await?;

    Ok(users)
}
