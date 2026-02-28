use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use http_body_util::BodyExt;
use tower::ServiceExt;
mod common;

#[sqlx::test]
async fn test_create_edit_request(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    let (_username, token) = common::create_test_user(&app).await;

    // 1. Create a collection and a question
    let collection_id = common::create_test_collection(&app, &token, true).await;
    let question_id = common::create_test_question(&app, &token, &collection_id).await;

    // 2. Create an edit request
    let body = serde_json::json!({
        "questionId": question_id,
        "questionText": "Modified Question Text",
        "correctAnswers": ["New Answer"],
        "descriptionText": "New Description",
        "reasonId": 1
    });

    let request = Request::builder()
        .method(http::Method::POST)
        .uri("/api/edit-requests")
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = response.into_body().collect().await.unwrap().to_bytes();
    let resp_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    
    assert!(resp_json.get("id").is_some());
    assert_eq!(resp_json.get("status").unwrap().as_str().unwrap(), "pending");
}

#[sqlx::test]
async fn test_list_and_approve_edit_request(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    
    // Owner of collection
    let (_owner_name, owner_token) = common::create_test_user(&app).await;
    // Requester
    let (_req_name, req_token) = common::create_test_user(&app).await;

    let collection_id = common::create_test_collection(&app, &owner_token, true).await;
    let question_id = common::create_test_question(&app, &owner_token, &collection_id).await;

    // 1. Create Request
    let body = serde_json::json!({
        "questionId": question_id,
        "questionText": "Improved Text",
        "correctAnswers": ["Answer"],
        "descriptionText": "New Desc",
        "reasonId": 2
    });

    let req_post = Request::builder()
        .method(http::Method::POST)
        .uri("/api/edit-requests")
        .header(http::header::AUTHORIZATION, format!("Bearer {}", req_token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();
    let res_post = app.clone().oneshot(req_post).await.unwrap();
    assert_eq!(res_post.status(), StatusCode::OK);
    
    let body_bytes = res_post.into_body().collect().await.unwrap().to_bytes();
    let post_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let request_id = post_json.get("id").unwrap().as_str().unwrap().to_string();

    // 2. List requests (as owner)
    let req_list = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/collections/{}/edit-requests", collection_id))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", owner_token))
        .body(Body::empty())
        .unwrap();
    let res_list = app.clone().oneshot(req_list).await.unwrap();
    assert_eq!(res_list.status(), StatusCode::OK);
    
    let body_bytes = res_list.into_body().collect().await.unwrap().to_bytes();
    let list_json: Vec<serde_json::Value> = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(list_json.len(), 1);

    // 3. Approve Request
    let status_body = serde_json::json!({
        "status": "approved"
    });
    let req_approve = Request::builder()
        .method(http::Method::PATCH)
        .uri(format!("/api/edit-requests/{}", request_id))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", owner_token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&status_body).unwrap()))
        .unwrap();
    let res_approve = app.clone().oneshot(req_approve).await.unwrap();
    assert_eq!(res_approve.status(), StatusCode::OK);

    // 4. Verify original question is updated (Indirectly check by status in response)
    let body_bytes = res_approve.into_body().collect().await.unwrap().to_bytes();
    let approve_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(approve_json.get("status").unwrap().as_str().unwrap(), "approved");
}
