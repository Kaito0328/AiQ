use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use http_body_util::BodyExt;
use tower::ServiceExt;

mod common;

#[sqlx::test]
async fn test_register_success(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    let (username, token) = common::create_test_user(&app).await;

    assert!(!username.is_empty());
    assert!(!token.is_empty());
}

#[sqlx::test]
async fn test_login_success(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. ヘルパーでテストユーザーを準備
    let (username, _) = common::create_test_user(&app).await;

    // 2. そのユーザーでログインを試みる
    let body = serde_json::json!({
        "username": username,
        "password": common::TEST_PASSWORD
    });

    let req_login = Request::builder()
        .method(http::Method::POST)
        .uri("/api/auth/login")
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.oneshot(req_login).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert!(body_json.get("token").is_some());
}

#[sqlx::test]
async fn test_error_duplicate_user(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. 1回目の登録（成功）
    let (username, _) = common::create_test_user(&app).await;

    // 2. 全く同じユーザー名で2回目の登録を試みる
    let body = serde_json::json!({
        "username": username,
        "password": common::TEST_PASSWORD
    });

    let req2 = Request::builder()
        .method(http::Method::POST)
        .uri("/api/auth/register")
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.oneshot(req2).await.unwrap();

    assert_eq!(response.status(), StatusCode::CONFLICT);

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(
        body_json.get("code").unwrap().as_str().unwrap(),
        "DUPLICATE_USER"
    );
}

#[sqlx::test]
async fn test_error_user_not_found(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let body = serde_json::json!({
        "username": "non_existent_user_9999",
        "password": "password123"
    });

    let request = Request::builder()
        .method(http::Method::POST)
        .uri("/api/auth/login")
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[sqlx::test]
async fn test_error_invalid_password(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. ユーザーを登録
    let (username, _) = common::create_test_user(&app).await;

    // 2. 間違ったパスワードでログイン
    let login_body = serde_json::json!({
        "username": username,
        "password": "wrong_password"
    });

    let req_login = Request::builder()
        .method(http::Method::POST)
        .uri("/api/auth/login")
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&login_body).unwrap()))
        .unwrap();

    let response = app.oneshot(req_login).await.unwrap();
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[sqlx::test]
async fn test_error_unauthorized_token(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let request = Request::builder()
        .method(http::Method::GET)
        .uri("/api/auth/me")
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}
