use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use http_body_util::BodyExt;
use tower::ServiceExt;

// 共通セットアップを読み込む
mod common;

#[tokio::test]
async fn test_register_success() {
    let app = common::setup_app().await;

    let body = serde_json::json!({
        "username": format!("test_user_{}", chrono::Utc::now().timestamp_subsec_micros()),
        "password": "password123"
    });

    let request = Request::builder()
        .method(http::Method::POST)
        .uri("/api/auth/register")
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert!(body_json.get("token").is_some());
}

#[tokio::test]
async fn test_login_success() {
    let app = common::setup_app().await;

    let username = format!("login_test_{}", chrono::Utc::now().timestamp_subsec_micros());
    let body = serde_json::json!({
        "username": username,
        "password": "login_password123"
    });

    let req_register = Request::builder()
        .method(http::Method::POST)
        .uri("/api/auth/register")
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let _ = app.clone().oneshot(req_register).await.unwrap();

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