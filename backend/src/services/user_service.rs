use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use sqlx::PgPool;
use crate::models::user::User;

// Javaの registerUser メソッドに相当
pub async fn register_user(
    pool: &PgPool,
    username: &str,
    password: &str,
) -> Result<User, String> {
    // 1. ユーザーの重複チェック
    let existing_user = crate::repositories::user::find_by_username(pool, username)
        .await
        .map_err(|e| e.to_string())?;

    if existing_user.is_some() {
        return Err("DUPLICATE_USER".to_string()); // 既存のErrorCodeに合わせています
    }

    // 2. パスワードのハッシュ化 (Argon2を使用)
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| e.to_string())?
        .to_string();

    // 3. データベースに保存
    let user = crate::repositories::user::create_user(pool, username, &password_hash)
        .await
        .map_err(|e| e.to_string())?;

    Ok(user)
}

// Javaの authenticate メソッドに相当
pub async fn authenticate(
    pool: &PgPool,
    username: &str,
    password: &str,
) -> Result<User, String> {
    // 1. ユーザーの検索
    let user = crate::repositories::user::find_by_username(pool, username)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "NOT_FOUND_USER".to_string())?;

    // 2. パスワードの照合
    let parsed_hash = PasswordHash::new(&user.password).map_err(|e| e.to_string())?;
    let argon2 = Argon2::default();

    if argon2.verify_password(password.as_bytes(), &parsed_hash).is_err() {
        return Err("INVALID_PASSWORD".to_string());
    }

    Ok(user)
}