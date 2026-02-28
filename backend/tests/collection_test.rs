use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use http_body_util::BodyExt;
use tower::ServiceExt;

mod common;

#[sqlx::test]
async fn test_create_collection_success(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    let (_username, token) = common::create_test_user(&app).await;

    // 共通関数を使って作成し、IDが返ってくることを確認
    let collection_id = common::create_test_collection(&app, &token, true).await;
    assert!(!collection_id.is_empty());
}

#[sqlx::test]
async fn test_get_collection_public(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    let (_username, owner_token) = common::create_test_user(&app).await;

    // 1. 公開(is_open=true)コレクションを作成
    let collection_id = common::create_test_collection(&app, &owner_token, true).await;

    // 2. トークンなし（未ログイン状態）で取得できるかテスト
    let request = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/collections/{}", collection_id))
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[sqlx::test]
async fn test_get_collection_private_protection(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // オーナーと別ユーザーを作成
    let (_owner_name, owner_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;

    // 1. 非公開(is_open=false)コレクションを作成
    let collection_id = common::create_test_collection(&app, &owner_token, false).await;

    // 2. オーナー本人が取得 -> OK
    let req_owner = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/collections/{}", collection_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_owner = app.clone().oneshot(req_owner).await.unwrap();
    assert_eq!(res_owner.status(), StatusCode::OK);

    // 3. 他人が取得 -> NOT_FOUND (存在を隠蔽するため)
    let req_other = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/collections/{}", collection_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_other = app.clone().oneshot(req_other).await.unwrap();
    assert_eq!(res_other.status(), StatusCode::NOT_FOUND);
}

#[sqlx::test]
async fn test_update_collection_protection(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let (_owner_name, owner_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;

    let collection_id = common::create_test_collection(&app, &owner_token, true).await;

    let update_body = serde_json::json!({
        "name": "Updated Name",
        "descriptionText": "Updated Bio",
        "isOpen": false
    });

    // 他人が更新を試みる -> FORBIDDEN
    let req_other = Request::builder()
        .method(http::Method::PUT)
        .uri(format!("/api/collections/{}", collection_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&update_body).unwrap()))
        .unwrap();
    let res_other = app.clone().oneshot(req_other).await.unwrap();
    assert_eq!(res_other.status(), StatusCode::FORBIDDEN);

    // オーナーが更新を試みる -> OK
    let req_owner = Request::builder()
        .method(http::Method::PUT)
        .uri(format!("/api/collections/{}", collection_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&update_body).unwrap()))
        .unwrap();
    let res_owner = app.clone().oneshot(req_owner).await.unwrap();
    assert_eq!(res_owner.status(), StatusCode::OK);
}

#[sqlx::test]
async fn test_get_user_collections(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let (owner_name, owner_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;

    // オーナーが「公開」と「非公開」を1つずつ作成
    common::create_test_collection(&app, &owner_token, true).await;
    common::create_test_collection(&app, &owner_token, false).await;

    // オーナー本人が一覧を取得 -> 2件見れるはず
    let req_owner = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/users/{}/collections", owner_name))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_owner = app.clone().oneshot(req_owner).await.unwrap();
    let body_bytes = res_owner.into_body().collect().await.unwrap().to_bytes();
    let collections_owner: Vec<serde_json::Value> = serde_json::from_slice(&body_bytes).unwrap();

    assert_eq!(collections_owner.len(), 2);

    // 他人が一覧を取得 -> 公開の1件しか見れないはず
    let req_other = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/users/{}/collections", owner_name))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", other_token),
        )
        .body(Body::empty())
        .unwrap();
    let res_other = app.clone().oneshot(req_other).await.unwrap();
    let body_bytes = res_other.into_body().collect().await.unwrap().to_bytes();
    let collections_other: Vec<serde_json::Value> = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(collections_other.len(), 1);
}

#[sqlx::test]
async fn test_delete_collection(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    let (_owner_name, owner_token) = common::create_test_user(&app).await;

    let collection_id = common::create_test_collection(&app, &owner_token, true).await;

    // 削除のテスト
    let delete_req = Request::builder()
        .method(http::Method::DELETE)
        .uri(format!("/api/collections/{}", collection_id))
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", owner_token),
        )
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(delete_req).await.unwrap();
    assert_eq!(response.status(), StatusCode::NO_CONTENT);

    // 削除後は取得できないことを確認
    let get_req = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/collections/{}", collection_id))
        .body(Body::empty())
        .unwrap();
    let get_res = app.oneshot(get_req).await.unwrap();
    assert_eq!(get_res.status(), StatusCode::NOT_FOUND);
}
