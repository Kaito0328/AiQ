use crate::dtos::user_dto::{
    ChangePasswordRequest, UpdateProfileRequest, UserProfileResponse, UserSearchQuery,
};
use crate::error::Result;
use crate::repositories::user;
use crate::{error::AppError, models::user::User};
use argon2::{
    Argon2,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn register_user(pool: &PgPool, username: &str, password: &str) -> Result<User> {
    let existing_user = crate::repositories::user::find_by_username(pool, username).await?;

    if existing_user.is_some() {
        return Err(AppError::DuplicateUser);
    }

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AppError::InternalServerError(e.to_string()))?
        .to_string();

    let user = crate::repositories::user::create_user(pool, username, &password_hash).await?;

    Ok(user)
}

pub async fn authenticate(pool: &PgPool, username: &str, password: &str) -> Result<User> {
    let user = crate::repositories::user::find_by_username(pool, username)
        .await?
        .ok_or(AppError::UserNotFound)?;

    let parsed_hash = PasswordHash::new(&user.password)
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    let argon2 = Argon2::default();

    if argon2
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return Err(AppError::InvalidPassword);
    }

    Ok(user)
}

pub async fn get_user_profile(
    pool: &PgPool,
    current_user_id: Option<Uuid>, // ログイン中の自分の名前 (未ログインの場合はNone)
    target_user_id: Uuid, 
) -> Result<UserProfileResponse> {
    // 2. リポジトリを呼び出してプロフィールを取得します
    let profile = user::get_profile(pool, current_user_id, target_user_id)
        .await?
        .ok_or(AppError::TargetUserNotFound)?;

    Ok(profile)
}

pub async fn search_users(
    pool: &PgPool,
    current_user_id: Uuid,
    params: UserSearchQuery,
) -> Result<Vec<UserProfileResponse>> {
    let users = user::search_users(pool, current_user_id, params).await?;

    Ok(users)
}

pub async fn change_password(
    pool: &PgPool,
    current_user_id: Uuid,
    req: ChangePasswordRequest,
) -> Result<()> {
    // 1. ユーザー情報(現在のパスワードハッシュ含む)を取得
    let user = user::find_by_id(pool, current_user_id)
        .await?
        .ok_or(AppError::UserNotFound)?;

    // 2. 古いパスワードが正しいか検証 (ログイン時と同じロジック)
    let parsed_hash = PasswordHash::new(&user.password)
        .map_err(|_| AppError::InternalServerError("Invalid password hash in DB".into()))?;

    Argon2::default()
        .verify_password(req.old_password.as_bytes(), &parsed_hash)
        .map_err(|_| AppError::InvalidPassword)?; // パスワード違いは 401 Unauthorized

    // 3. 新しいパスワードをハッシュ化
    let salt = SaltString::generate(&mut OsRng);
    let new_password_hash = Argon2::default()
        .hash_password(req.new_password.as_bytes(), &salt)
        .map_err(|e| AppError::InternalServerError(e.to_string()))?
        .to_string();

    // 4. DBを更新
    user::update_password(pool, user.id, &new_password_hash).await?;

    Ok(())
}

pub async fn update_user_profile(
    pool: &PgPool,
    current_user_id: Uuid,
    req: UpdateProfileRequest,
) -> Result<User> {
    // ユーザー名の変更を含む更新を実行
    let updated_user = user::update_profile(
        pool,
        current_user_id,
        req.username, // 追加
        req.display_name,
        req.bio,
        req.icon_url,
    )
    .await?;

    Ok(updated_user)
}
