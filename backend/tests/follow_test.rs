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
#[sqlx::test]
async fn test_get_followers_and_followees(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    let (alice_name, alice_token) = common::create_test_user(&app).await;
    let (bob_name, _bob_token) = common::create_test_user(&app).await;

    // Alice follows Bob
    let follow_uri = format!("/api/users/{}/follow", bob_name);
    let follow_req = Request::builder()
        .method(http::Method::POST)
        .uri(follow_uri)
        .header(http::header::AUTHORIZATION, format!("Bearer {}", alice_token))
        .body(Body::empty())
        .unwrap();
    app.clone().oneshot(follow_req).await.unwrap();

    // 1. Check Bob's followers -> Alice should be there
    // Get Bob's ID first
    let req_profile = Request::builder()
        .uri(format!("/api/users/{}", bob_name))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", alice_token))
        .body(Body::empty())
        .unwrap();
    let res_profile = app.clone().oneshot(req_profile).await.unwrap();
    let body_bytes = http_body_util::BodyExt::collect(res_profile.into_body()).await.unwrap().to_bytes();
    let bob_profile: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let bob_id = bob_profile.get("id").unwrap().as_str().unwrap();

    let req_followers = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/users/{}/followers", bob_id))
        .body(Body::empty())
        .unwrap();
    let res_followers = app.clone().oneshot(req_followers).await.unwrap();
    assert_eq!(res_followers.status(), StatusCode::OK);
    let body_bytes = http_body_util::BodyExt::collect(res_followers.into_body()).await.unwrap().to_bytes();
    let followers: Vec<serde_json::Value> = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(followers.len(), 1);
    assert_eq!(followers[0].get("username").unwrap().as_str().unwrap(), alice_name);

    // 2. Check Alice's followees (Alice follows Bob) -> Bob should be there
    // Get Alice's ID first
    let _alice_id = bob_profile.get("isMe").is_some(); // Wait, I'll just get alice's profile properly
    let req_alice_profile = Request::builder()
        .uri(format!("/api/users/{}", alice_name))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", alice_token))
        .body(Body::empty())
        .unwrap();
    let res_alice_profile = app.clone().oneshot(req_alice_profile).await.unwrap();
    let body_bytes = http_body_util::BodyExt::collect(res_alice_profile.into_body()).await.unwrap().to_bytes();
    let alice_profile: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let alice_id = alice_profile.get("id").unwrap().as_str().unwrap();

    let req_followees = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/users/{}/followees", alice_id))
        .body(Body::empty())
        .unwrap();
    let res_followees = app.clone().oneshot(req_followees).await.unwrap();
    assert_eq!(res_followees.status(), StatusCode::OK);
    let body_bytes = http_body_util::BodyExt::collect(res_followees.into_body()).await.unwrap().to_bytes();
    let followees: Vec<serde_json::Value> = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(followees.len(), 1);
    assert_eq!(followees[0].get("username").unwrap().as_str().unwrap(), bob_name);
}
