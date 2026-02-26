use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use tower::ServiceExt;

mod common;

pub async fn create_test_collection_set(app: &axum::Router, token: &str, is_open: bool) -> String {
    let body = serde_json::json!({
        "name": format!("Test Collection Set {}", uuid::Uuid::new_v4()),
        "description_text": "This is a test collection set.",
        "is_open": is_open
    });

    let request = axum::http::Request::builder()
        .method(axum::http::Method::POST)
        .uri("/api/collection-sets")
        .header(
            axum::http::header::AUTHORIZATION,
            format!("Bearer {}", token),
        )
        .header(axum::http::header::CONTENT_TYPE, "application/json")
        .body(axum::body::Body::from(serde_json::to_vec(&body).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), axum::http::StatusCode::CREATED);

    let body_bytes = http_body_util::BodyExt::collect(response.into_body())
        .await
        .unwrap()
        .to_bytes();
    let body_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();

    body_json.get("id").unwrap().as_str().unwrap().to_string()
}

#[sqlx::test]
async fn test_create_collection_set_success(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let (_owner_name, token) = common::create_test_user(&app).await;

    // ヘルパー関数を使ってまとめ枠作成（中で 201 CREATED のアサート済み）
    let set_id = create_test_collection_set(&app, &token, true).await;
    assert!(!set_id.is_empty());
}

#[sqlx::test]
async fn test_get_collection_set_access_control(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let (_owner_name, owner_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;

    // 1. 【公開】まとめ枠を作成
    let public_set_id = create_test_collection_set(&app, &owner_token, true).await;

    // 2. 【非公開】まとめ枠を作成
    let private_set_id = create_test_collection_set(&app, &owner_token, false).await;

    // --- テスト開始 ---

    // 他人が公開まとめ枠を取得 -> OK
    let req_get_public = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/collection-sets/{}", public_set_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_get_public = app.clone().oneshot(req_get_public).await.unwrap();
    assert_eq!(res_get_public.status(), StatusCode::OK);

    // 他人が非公開まとめ枠を取得 -> NOT_FOUND (隠蔽される)
    let req_get_private_other = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/collection-sets/{}", private_set_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_get_private_other = app.clone().oneshot(req_get_private_other).await.unwrap();
    assert_eq!(res_get_private_other.status(), StatusCode::NOT_FOUND);

    // オーナー自身が非公開まとめ枠を取得 -> OK
    let req_get_private_owner = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/collection-sets/{}", private_set_id))
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
async fn test_update_and_delete_collection_set(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let (_owner_name, owner_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;

    let set_id = create_test_collection_set(&app, &owner_token, true).await;

    // 1. 他人が更新しようとする -> FORBIDDEN
    let update_body = serde_json::json!({
        "name": "悪意のある書き換え",
        "description_text": "ハッカー",
        "is_open": false
    });
    let req_update_other = Request::builder()
        .method(http::Method::PUT)
        .uri(format!("/api/collection-sets/{}", set_id))
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
        .uri(format!("/api/collection-sets/{}", set_id))
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
        .uri(format!("/api/collection-sets/{}", set_id))
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
        .uri(format!("/api/collection-sets/{}", set_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_delete_owner = app.clone().oneshot(req_delete_owner).await.unwrap();
    assert_eq!(res_delete_owner.status(), StatusCode::NO_CONTENT);
}

#[sqlx::test]
async fn test_add_and_remove_collection_from_set(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let (_owner_name, owner_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;

    // まとめ枠と追加用のコレクションを作成
    let set_id = create_test_collection_set(&app, &owner_token, true).await;
    let collection_id = common::create_test_collection(&app, &owner_token, true).await;

    // 1. 他人がまとめ枠にコレクションを追加しようとする -> FORBIDDEN
    let add_body = serde_json::json!({
        "collection_id": collection_id,
        "display_order": 1
    });
    let req_add_other = Request::builder()
        .method(http::Method::POST)
        .uri(format!("/api/collection-sets/{}/collections", set_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&add_body).unwrap()))
        .unwrap();
    let res_add_other = app.clone().oneshot(req_add_other).await.unwrap();
    assert_eq!(res_add_other.status(), StatusCode::FORBIDDEN);

    // 2. オーナーがまとめ枠にコレクションを追加する -> CREATED
    let req_add_owner = Request::builder()
        .method(http::Method::POST)
        .uri(format!("/api/collection-sets/{}/collections", set_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&add_body).unwrap()))
        .unwrap();
    let res_add_owner = app.clone().oneshot(req_add_owner).await.unwrap();
    assert_eq!(res_add_owner.status(), StatusCode::CREATED);

    // 3. 他人がまとめ枠からコレクションを外そうとする -> FORBIDDEN
    let req_remove_other = Request::builder()
        .method(http::Method::DELETE)
        .uri(format!(
            "/api/collection-sets/{}/collections/{}",
            set_id, collection_id
        ))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_remove_other = app.clone().oneshot(req_remove_other).await.unwrap();
    assert_eq!(res_remove_other.status(), StatusCode::FORBIDDEN);

    // 4. オーナーがまとめ枠からコレクションを外す -> NO_CONTENT
    let req_remove_owner = Request::builder()
        .method(http::Method::DELETE)
        .uri(format!(
            "/api/collection-sets/{}/collections/{}",
            set_id, collection_id
        ))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_remove_owner = app.clone().oneshot(req_remove_owner).await.unwrap();
    assert_eq!(res_remove_owner.status(), StatusCode::NO_CONTENT);

    // 5. 新機能テスト：他人が作った公開コレクションを自分のまとめ枠に追加する -> CREATED
    let other_public_coll = common::create_test_collection(&app, &other_token, true).await;
    let add_other_public_body = serde_json::json!({
        "collection_id": other_public_coll,
        "display_order": 2
    });
    let req_add_public = Request::builder()
        .method(http::Method::POST)
        .uri(format!("/api/collection-sets/{}/collections", set_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token), // 追加するのはオーナー
        )
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&add_other_public_body).unwrap()))
        .unwrap();
    let res_add_public = app.clone().oneshot(req_add_public).await.unwrap();
    assert_eq!(res_add_public.status(), StatusCode::CREATED);

    // 6. 新機能テスト：他人が作った非公開コレクションを自分のまとめ枠に追加する -> FORBIDDEN
    let other_private_coll = common::create_test_collection(&app, &other_token, false).await;
    let add_other_private_body = serde_json::json!({
        "collection_id": other_private_coll,
        "display_order": 3
    });
    let req_add_private = Request::builder()
        .method(http::Method::POST)
        .uri(format!("/api/collection-sets/{}/collections", set_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&add_other_private_body).unwrap()))
        .unwrap();
    let res_add_private = app.clone().oneshot(req_add_private).await.unwrap();
    assert_eq!(res_add_private.status(), StatusCode::FORBIDDEN);
}
