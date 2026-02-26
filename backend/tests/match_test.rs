use axum::{
    body::Body,
    http::{self, Request},
};
use tower::ServiceExt;

mod common;

#[sqlx::test]
async fn test_create_match_room(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    let (_username, token) = common::create_test_user(&app).await;

    // 1. Create a Collection with some questions
    let collection_id = common::create_test_collection(&app, &token, true).await;
    
    // Create 3 questions
    for _ in 0..3 {
        common::create_test_question(&app, &token, &collection_id).await;
    }

    // 2. Test Match Room creation
    let body = serde_json::json!({
        "collection_ids": [collection_id],
        "filter_types": [],
        "sort_keys": ["random"],
        "total_questions": 3,
        "max_buzzes_per_round": 1
    });

    let request = Request::builder()
        .method(http::Method::POST)
        .uri("/api/match/room")
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();

    // Verify
    assert_eq!(response.status(), http::StatusCode::OK);

    // Parse Response
    let body_bytes = http_body_util::BodyExt::collect(response.into_body()).await.unwrap().to_bytes();
    let resp_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    
    assert!(resp_json.get("room_id").is_some());
    assert!(resp_json.get("join_token").is_some());
}
