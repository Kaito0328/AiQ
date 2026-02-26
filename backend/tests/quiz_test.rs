use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use http_body_util::BodyExt;
use tower::ServiceExt;

mod common;

#[sqlx::test]
async fn test_casual_quiz_flow(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. Create a user, collection, and a question
    let (_username, token) = common::create_test_user(&app).await;
    let collection_id = common::create_test_collection(&app, &token, true).await;

    // Add 2 questions
    common::create_test_question(&app, &token, &collection_id).await;
    let _ = common::create_test_question(&app, &token, &collection_id).await;

    // 2. Start a casual quiz
    let start_body = serde_json::json!({
        "collection_ids": [collection_id],
        "filter_types": ["ALL"],
        "sort_keys": ["RANDOM"],
        "total_questions": 2
    });

    let req_start = Request::builder()
        .method(http::Method::POST)
        .uri("/api/quiz/start")
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&start_body).unwrap()))
        .unwrap();

    let res_start = app.clone().oneshot(req_start).await.unwrap();
    assert_eq!(res_start.status(), StatusCode::OK);

    let body_bytes = res_start.into_body().collect().await.unwrap().to_bytes();
    let quiz: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let quiz_id = quiz.get("id").unwrap().as_str().unwrap().to_string();
    let q_ids = quiz.get("question_ids").unwrap().as_array().unwrap();
    assert_eq!(q_ids.len(), 2);

    let target_question_id = q_ids[0].as_str().unwrap().to_string();

    // 3. Submit an answer to the first question
    let submit_body = serde_json::json!({
        "question_id": target_question_id,
        "user_answer": "Answer",
        "elapsed_millis": 1500
    });

    let req_submit = Request::builder()
        .method(http::Method::POST)
        .uri(format!("/api/quiz/{}/submit", quiz_id))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&submit_body).unwrap()))
        .unwrap();

    let res_submit = app.clone().oneshot(req_submit).await.unwrap();
    assert_eq!(res_submit.status(), StatusCode::OK);

    let body_bytes = res_submit.into_body().collect().await.unwrap().to_bytes();
    let updated_quiz: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(
        updated_quiz.get("correct_count").unwrap().as_i64().unwrap(),
        1
    );
    assert!(updated_quiz.get("is_active").unwrap().as_bool().unwrap()); // Still active, 1 question left

    // 4. Check get resumes
    let req_resumes = Request::builder()
        .method(http::Method::GET)
        .uri("/api/quiz/resumes")
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let res_resumes = app.clone().oneshot(req_resumes).await.unwrap();
    assert_eq!(res_resumes.status(), StatusCode::OK);

    let body_bytes = res_resumes.into_body().collect().await.unwrap().to_bytes();
    let resumes: Vec<serde_json::Value> = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(resumes.len(), 1); // Our active quiz should be here

    // 5. Submit final answer
    let target_question_id_2 = q_ids[1].as_str().unwrap().to_string();
    let submit_body_2 = serde_json::json!({
        "question_id": target_question_id_2,
        "user_answer": "Wrong",
        "elapsed_millis": 1000
    });

    let req_submit_2 = Request::builder()
        .method(http::Method::POST)
        .uri(format!("/api/quiz/{}/submit", quiz_id))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&submit_body_2).unwrap()))
        .unwrap();

    let res_submit_2 = app.clone().oneshot(req_submit_2).await.unwrap();
    assert_eq!(res_submit_2.status(), StatusCode::OK);

    let body_bytes = res_submit_2.into_body().collect().await.unwrap().to_bytes();
    let final_quiz: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert!(!final_quiz.get("is_active").unwrap().as_bool().unwrap()); // No longer active!
}
