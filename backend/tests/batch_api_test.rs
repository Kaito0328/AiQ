use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use http_body_util::BodyExt;
use tower::ServiceExt;

mod common;

#[sqlx::test]
async fn test_batch_collections(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    let (_username, token) = common::create_test_user(&app).await;

    // First create a single collection to update and delete
    let collection_id = common::create_test_collection(&app, &token, true).await;

    let batch_body = serde_json::json!({
        "upsert_items": [
            {
                "id": collection_id,
                "name": "Updated Batch Name",
                "description_text": "Updated via batch",
                "is_open": false
            },
            {
                "id": null,
                "name": "New Batch Collection",
                "description_text": "Created via batch",
                "is_open": true
            }
        ],
        "delete_ids": []
    });

    let req_batch = Request::builder()
        .method(http::Method::POST)
        .uri("/api/collections/batch")
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&batch_body).unwrap()))
        .unwrap();

    let res_batch = app.clone().oneshot(req_batch).await.unwrap();
    assert_eq!(res_batch.status(), StatusCode::OK);

    let body_bytes = res_batch.into_body().collect().await.unwrap().to_bytes();
    let result: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(result.get("upserted_count").unwrap().as_i64().unwrap(), 2);
    assert_eq!(result.get("deleted_count").unwrap().as_i64().unwrap(), 0);
}

#[sqlx::test]
async fn test_batch_questions(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    let (_username, token) = common::create_test_user(&app).await;

    let collection_id = common::create_test_collection(&app, &token, true).await;
    let question_id = common::create_test_question(&app, &token, &collection_id).await;

    let batch_body = serde_json::json!({
        "upsert_items": [
            {
                "id": null,
                "question_text": "New Batch Question",
                "correct_answer": "Batch Answer",
                "description_text": "Desc"
            }
        ],
        "delete_ids": [question_id]
    });

    let req_batch = Request::builder()
        .method(http::Method::POST)
        .uri(format!(
            "/api/collections/{}/questions/batch",
            collection_id
        ))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&batch_body).unwrap()))
        .unwrap();

    let res_batch = app.clone().oneshot(req_batch).await.unwrap();
    assert_eq!(res_batch.status(), StatusCode::OK);

    let body_bytes = res_batch.into_body().collect().await.unwrap().to_bytes();
    let result: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(result.get("upserted_count").unwrap().as_i64().unwrap(), 1);
    assert_eq!(result.get("deleted_count").unwrap().as_i64().unwrap(), 1);
}
