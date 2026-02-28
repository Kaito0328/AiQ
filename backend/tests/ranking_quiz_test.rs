use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use backend::dtos::ranking_quiz_dto::{
    StartRankingQuizRequest, StartRankingQuizResponse, SubmitRankingAnswerRequest,
    SubmitRankingAnswerResponse,
};
use http_body_util::BodyExt;
use tower::ServiceExt;
use uuid::Uuid;

mod common;

#[sqlx::test]
async fn test_ranking_quiz_flow(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. Create User & Token
    let (_username, token) = common::create_test_user(&app).await;

    // 2. Create Collection & Questions
    let collection_id_str = common::create_test_collection(&app, &token, true).await;
    let collection_id = Uuid::parse_str(&collection_id_str).unwrap();

    let q1_id_str = common::create_test_question(&app, &token, &collection_id_str).await;
    let q2_id_str = common::create_test_question(&app, &token, &collection_id_str).await;
    let q1_id = Uuid::parse_str(&q1_id_str).unwrap();
    let q2_id = Uuid::parse_str(&q2_id_str).unwrap();

    // 3. Start Ranking Quiz
    let start_req = StartRankingQuizRequest { collection_id };
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/ranking-quiz/start")
                .header("Content-Type", "application/json")
                .header("Authorization", format!("Bearer {}", token))
                .body(Body::from(serde_json::to_vec(&start_req).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = response.into_body().collect().await.unwrap().to_bytes();
    let start_resp: StartRankingQuizResponse = serde_json::from_slice(&body).unwrap();

    assert_eq!(start_resp.total_questions, 2);
    assert!(!start_resp.questions.is_empty());

    let quiz_id = start_resp.quiz_id;
    let first_q = start_resp.questions.first().unwrap();

    let is_first_q1 = first_q.id == q1_id;
    let wrong_q_id_to_test_cheat = if is_first_q1 { q2_id } else { q1_id };

    // 4. Anti-cheat Test: Submit answer for the WRONG question ID
    let cheat_req = SubmitRankingAnswerRequest {
        question_id: wrong_q_id_to_test_cheat,
        answer: "HACK".to_string(),
        time_taken_millis: 1000,
    };

    let cheat_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/ranking-quiz/{}/submit", quiz_id))
                .header("Content-Type", "application/json")
                .header("Authorization", format!("Bearer {}", token))
                .body(Body::from(serde_json::to_vec(&cheat_req).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(cheat_response.status(), StatusCode::INTERNAL_SERVER_ERROR);

    // 5. Submit Correct Answer for the FIRST question
    // Note: common::create_test_question hardcodes correct_answer to "Answer"
    let submit_req1 = SubmitRankingAnswerRequest {
        question_id: first_q.id,
        answer: "Answer".to_string(),
        time_taken_millis: 1500,
    };

    let response1 = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/ranking-quiz/{}/submit", quiz_id))
                .header("Content-Type", "application/json")
                .header("Authorization", format!("Bearer {}", token))
                .body(Body::from(serde_json::to_vec(&submit_req1).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response1.status(), StatusCode::OK);
    let body1 = response1.into_body().collect().await.unwrap().to_bytes();
    let resp1: SubmitRankingAnswerResponse = serde_json::from_slice(&body1).unwrap();

    assert!(resp1.is_correct);
    assert_eq!(resp1.correct_answer, "Answer");
    assert!(!resp1.is_completed);
    assert!(resp1.next_question.is_some());
    assert!(resp1.result.is_none());

    let second_q = resp1.next_question.unwrap();

    // 6. Submit Incorrect Answer for the SECOND question
    let submit_req2 = SubmitRankingAnswerRequest {
        question_id: second_q.id,
        answer: "WRONG_ANSWER".to_string(),
        time_taken_millis: 2000,
    };

    let response2 = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/ranking-quiz/{}/submit", quiz_id))
                .header("Content-Type", "application/json")
                .header("Authorization", format!("Bearer {}", token))
                .body(Body::from(serde_json::to_vec(&submit_req2).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response2.status(), StatusCode::OK);
    let body2 = response2.into_body().collect().await.unwrap().to_bytes();
    let resp2: SubmitRankingAnswerResponse = serde_json::from_slice(&body2).unwrap();

    assert!(!resp2.is_correct);
    assert!(resp2.is_completed);
    assert!(resp2.next_question.is_none());
    assert!(resp2.result.is_some());

    // 7. Verify Results Score
    let final_result = resp2.result.unwrap();
    assert_eq!(final_result.total_questions, 2);
    assert_eq!(final_result.correct_count, 1);

    // 8. Test Leaderboard
    let req_lb = Request::builder()
        .method("GET")
        .uri(format!("/api/collections/{}/leaderboard", collection_id))
        .body(Body::empty())
        .unwrap();
    let res_lb = app.clone().oneshot(req_lb).await.unwrap();
    assert_eq!(res_lb.status(), StatusCode::OK);
    
    let body_lb = res_lb.into_body().collect().await.unwrap().to_bytes();
    let lb_resp: serde_json::Value = serde_json::from_slice(&body_lb).unwrap();
    let entries = lb_resp.get("entries").unwrap().as_array().unwrap();
    assert!(!entries.is_empty());
    // The user should be in the leaderboard
    assert!(entries.iter().any(|entry| entry.get("username").unwrap().as_str().unwrap() == _username));
}
