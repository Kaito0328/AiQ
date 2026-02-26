use axum::{
    Router,
    body::Body,
    http::{self, Request},
};
use backend::{app, state::AppState};
use http_body_util::BodyExt;
use sqlx::PgPool;
use tower::ServiceExt;

pub const TEST_PASSWORD: &str = "password123";

// 引数で sqlx::test から自動生成された空のデータベース(pool)を受け取ります
pub async fn setup_app(pool: PgPool) -> Router {
    let state = AppState::new(pool);
    app(state)
}

// ユーザー作成関数はご提示いただいたものをそのまま使用します
pub async fn create_test_user(app: &Router) -> (String, String) {
    let username = format!("test_user_{}", uuid::Uuid::new_v4());

    let body = serde_json::json!({
        "username": username,
        "password": TEST_PASSWORD
    });

    let request = Request::builder()
        .method(http::Method::POST)
        .uri("/api/auth/register")
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();

    let status = response.status();
    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();

    if status != http::StatusCode::OK {
        // 何のエラーが起きているのかコンソールに表示して強制終了します
        panic!(
            "ユーザー登録テスト失敗! Status: {}, Body: {}",
            status,
            String::from_utf8_lossy(&body_bytes)
        );
    }
    // assert_eq!(response.status(), http::StatusCode::OK);

    // let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let token = body_json
        .get("token")
        .unwrap()
        .as_str()
        .unwrap()
        .to_string();

    (username, token)
}

#[allow(dead_code)]
// テスト用のコレクションを作成し、そのID(UUID)を返す関数
pub async fn create_test_collection(app: &Router, token: &str, is_open: bool) -> String {
    let body = serde_json::json!({
        "name": format!("Test Collection {}", uuid::Uuid::new_v4()),
        "description_text": "This is a test.",
        "is_open": is_open
    });

    let request = Request::builder()
        .method(http::Method::POST)
        .uri("/api/collections")
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), http::StatusCode::CREATED);

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();

    body_json.get("id").unwrap().as_str().unwrap().to_string()
}

#[allow(dead_code)]
pub async fn create_test_question(app: &Router, token: &str, collection_id: &str) -> String {
    let body = serde_json::json!({
        "question_text": format!("Question {}", uuid::Uuid::new_v4()),
        "correct_answer": "Answer",
        "description_text": "Desc"
    });

    let request = Request::builder()
        .method(http::Method::POST)
        .uri(format!("/api/collections/{}/questions", collection_id))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), http::StatusCode::CREATED);

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let body_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();

    body_json.get("id").unwrap().as_str().unwrap().to_string()
}
