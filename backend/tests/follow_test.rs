use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use tower::ServiceExt;

mod common;

#[sqlx::test]
async fn test_follow_user_success(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. テスト用のユーザーを2人作成します
    let (_follower_name, follower_token) = common::create_test_user(&app).await;
    let (followee_name, _) = common::create_test_user(&app).await;

    // 2. フォローAPIを叩きます（follower が followee をフォロー）
    let uri = format!("/api/users/{}/follow", followee_name);
    let request = Request::builder()
        .method(http::Method::POST)
        .uri(uri)
        // 取得した生のトークンをそのまま Authorization ヘッダーに使えます
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", follower_token),
        )
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    // 3. 成功(200 OK)が返ってくることを検証します
    assert_eq!(response.status(), StatusCode::OK);
}

#[sqlx::test]
async fn test_cannot_follow_self(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. ユーザーを1人だけ作成
    let (username, token) = common::create_test_user(&app).await;

    // 2. 自分自身をフォローしようとするリクエスト
    let uri = format!("/api/users/{}/follow", username);
    let request = Request::builder()
        .method(http::Method::POST)
        .uri(uri)
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    // 3. 400 Bad Request が返ってくることを検証します
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

// tests/follow_test.rs の末尾に追記します

#[sqlx::test]
async fn test_unfollow_user_success(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // テストユーザーを2人作成します
    let (_follower_name, follower_token) = common::create_test_user(&app).await;
    let (followee_name, _) = common::create_test_user(&app).await;

    let uri = format!("/api/users/{}/follow", followee_name);

    // 1. 準備として, まず相手をフォローします (POSTリクエスト)
    let follow_req = Request::builder()
        .method(http::Method::POST)
        .uri(&uri)
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", follower_token),
        )
        .body(Body::empty())
        .unwrap();

    // clone() を使ってアプリのコピーを渡し, リクエストを送信します
    let _ = app.clone().oneshot(follow_req).await.unwrap();

    // 2. フォローを解除します (DELETEリクエスト)
    let unfollow_req = Request::builder()
        .method(http::Method::DELETE)
        .uri(&uri)
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", follower_token),
        )
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(unfollow_req).await.unwrap();

    // 3. 成功(200 OK)が返ってくることを検証します
    assert_eq!(response.status(), StatusCode::OK);
}

#[sqlx::test]
async fn test_cannot_unfollow_self(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // ユーザーを1人だけ作成します
    let (username, token) = common::create_test_user(&app).await;

    // 自分自身をアンフォローしようとするリクエスト (DELETE)
    let uri = format!("/api/users/{}/follow", username);
    let request = Request::builder()
        .method(http::Method::DELETE)
        .uri(uri)
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    // 400 Bad Request が返ってくることを検証します
    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}
