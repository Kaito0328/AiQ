// src/services/follow_service.rs
use crate::error::{AppError, Result};
use crate::repositories::follow;
use sqlx::PgPool;
use uuid::Uuid; // userリポジトリも使います

pub async fn follow(
    pool: &PgPool,
    follower_id: Uuid, // フォローする側（自分）
    followee_id: Uuid, // フォローされる側（相手）
) -> Result<()> {
    // 1. 自分自身をフォローしようとしていないかチェック
    if follower_id == followee_id {
        return Err(AppError::CannotFollowSelf);
    }

    // 4. リポジトリを呼び出してデータベースを更新（前回作った関数です）
    follow::follow_user(pool, follower_id, followee_id).await?;

    Ok(())
}

pub async fn unfollow(
    pool: &PgPool,
    follower_id: Uuid, // アンフォローする側（自分）
    followee_id: Uuid, // アンフォローされる側（相手）
) -> Result<()> {
    // 1. 自分自身をアンフォローしようとしていないかチェック
    if follower_id == followee_id {
        return Err(AppError::CannotUnfollowSelf);
    }

    // 4. リポジトリを呼び出してデータベースを更新
    follow::unfollow_user(pool, follower_id, followee_id).await?;

    Ok(())
}

pub async fn get_followers(
    pool: &PgPool,
    login_user_id: Option<Uuid>,
    target_user_id: Uuid,
) -> Result<Vec<crate::dtos::user_dto::UserProfileResponse>> {
    follow::get_followers(pool, login_user_id, target_user_id).await
}

pub async fn get_followees(
    pool: &PgPool,
    login_user_id: Option<Uuid>,
    target_user_id: Uuid,
) -> Result<Vec<crate::dtos::user_dto::UserProfileResponse>> {
    follow::get_followees(pool, login_user_id, target_user_id).await
}
