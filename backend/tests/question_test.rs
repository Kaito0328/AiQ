use axum::{
    Router,
    body::Body,
    http::{self, Request, StatusCode},
};
use http_body_util::BodyExt;
use tower::ServiceExt;

mod common;

pub async fn create_test_question(
    app: &Router,
    token: &str,
    collection_id: &str,
    question_text: &str,
) -> String {
    let body = serde_json::json!({
        "questionText": question_text,
        "correctAnswers": ["正解です"],
        "descriptionText": "解説テキスト"
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

#[sqlx::test]
async fn test_create_question_success(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. ユーザーと親コレクションを作成
    let (_owner_name, token) = common::create_test_user(&app).await;
    let collection_id = common::create_test_collection(&app, &token, true).await;

    // 2. ヘルパー関数を使って問題作成（中で 201 CREATED のアサート済み）
    let question_id =
        create_test_question(&app, &token, &collection_id, "Rustの所有権とは何ですか？").await;

    assert!(!question_id.is_empty());
}

#[sqlx::test]
async fn test_create_question_forbidden(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // オーナーと別ユーザーを作成
    let (_owner_name, owner_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;

    // オーナーがコレクションを作成
    let collection_id = common::create_test_collection(&app, &owner_token, true).await;

    // 他人がそのコレクションに問題を追加しようとする -> FORBIDDEN になるはず
    let create_body = serde_json::json!({
        "questionText": "ハッキング問題",
        "correctAnswers": ["不正解"],
    });

    let req_create = Request::builder()
        .method(http::Method::POST)
        .uri(format!("/api/collections/{}/questions", collection_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&create_body).unwrap()))
        .unwrap();

    let res_create = app.oneshot(req_create).await.unwrap();
    assert_eq!(res_create.status(), StatusCode::FORBIDDEN);
}

#[sqlx::test]
async fn test_get_collection_questions_access_control(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let (_owner_name, owner_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;

    // 1. 【公開】コレクションと問題を作成
    let public_collection_id = common::create_test_collection(&app, &owner_token, true).await;
    create_test_question(&app, &owner_token, &public_collection_id, "公開問題").await;

    // 2. 【非公開】コレクションと問題を作成
    let private_collection_id = common::create_test_collection(&app, &owner_token, false).await;
    create_test_question(&app, &owner_token, &private_collection_id, "非公開問題").await;

    // --- テスト開始 ---

    // 他人が公開コレクションの問題を取得 -> OK (1件取得できる)
    let req_get_public = Request::builder()
        .method(http::Method::GET)
        .uri(format!(
            "/api/collections/{}/questions",
            public_collection_id
        ))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_get_public = app.clone().oneshot(req_get_public).await.unwrap();
    assert_eq!(res_get_public.status(), StatusCode::OK);

    // 他人が非公開コレクションの問題を取得 -> NOT_FOUND (親コレクションごと隠蔽される)
    let req_get_private_other = Request::builder()
        .method(http::Method::GET)
        .uri(format!(
            "/api/collections/{}/questions",
            private_collection_id
        ))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_get_private_other = app.clone().oneshot(req_get_private_other).await.unwrap();
    assert_eq!(res_get_private_other.status(), StatusCode::NOT_FOUND);

    // オーナー自身が非公開コレクションの問題を取得 -> OK
    let req_get_private_owner = Request::builder()
        .method(http::Method::GET)
        .uri(format!(
            "/api/collections/{}/questions",
            private_collection_id
        ))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_get_private_owner = app.clone().oneshot(req_get_private_owner).await.unwrap();
    assert_eq!(res_get_private_owner.status(), StatusCode::OK);
}

#[sqlx::test]
async fn test_update_and_delete_question(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let (_owner_name, owner_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;

    // コレクションと問題を作成
    let collection_id = common::create_test_collection(&app, &owner_token, true).await;
    let question_id = create_test_question(&app, &owner_token, &collection_id, "元の問題").await;

    // 1. 他人が更新しようとする -> FORBIDDEN
    let update_body = serde_json::json!({
        "questionText": "悪意のある書き換え",
        "correctAnswers": ["ハッカー"],
    });
    let req_update_other = Request::builder()
        .method(http::Method::PUT)
        .uri(format!("/api/questions/{}", question_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&update_body).unwrap()))
        .unwrap();
    let res_update_other = app.clone().oneshot(req_update_other).await.unwrap();
    assert_eq!(res_update_other.status(), StatusCode::FORBIDDEN);

    // 2. オーナーが更新する -> OK
    let req_update_owner = Request::builder()
        .method(http::Method::PUT)
        .uri(format!("/api/questions/{}", question_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&update_body).unwrap()))
        .unwrap();
    let res_update_owner = app.clone().oneshot(req_update_owner).await.unwrap();
    assert_eq!(res_update_owner.status(), StatusCode::OK);

    // 3. 他人が削除しようとする -> FORBIDDEN
    let req_delete_other = Request::builder()
        .method(http::Method::DELETE)
        .uri(format!("/api/questions/{}", question_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_delete_other = app.clone().oneshot(req_delete_other).await.unwrap();
    assert_eq!(res_delete_other.status(), StatusCode::FORBIDDEN);

    // 4. オーナーが削除する -> NO_CONTENT
    let req_delete_owner = Request::builder()
        .method(http::Method::DELETE)
        .uri(format!("/api/questions/{}", question_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_delete_owner = app.clone().oneshot(req_delete_owner).await.unwrap();
    assert_eq!(res_delete_owner.status(), StatusCode::NO_CONTENT);
}
