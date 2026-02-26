use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use tower::ServiceExt; // oneshotを使うために必要

mod common;

#[sqlx::test]
async fn test_get_own_profile(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. テストユーザーを作成
    let (username, token) = common::create_test_user(&app).await;

    // 2. 自分のプロフィールを取得するリクエスト
    let uri = format!("/api/users/{}", username);
    let request = Request::builder()
        .method(http::Method::GET)
        .uri(uri)
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    // 3. レスポンスの中身を検証
    let body_bytes = http_body_util::BodyExt::collect(response.into_body())
        .await
        .unwrap()
        .to_bytes();
    let body_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();

    // 自分自身なので is_self は true のはず
    assert_eq!(body_json["username"], username);
    assert_eq!(body_json["is_self"], true);
    assert_eq!(body_json["is_following"], false); // 自分をフォローはできないのでfalse
}

#[sqlx::test]
async fn test_get_other_profile_with_follow(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. 自分(Alice)と相手(Bob)を作成
    let (_alice_name, alice_token) = common::create_test_user(&app).await;
    let (bob_name, _bob_token) = common::create_test_user(&app).await;

    // 2. Alice が Bob をフォローする
    let follow_uri = format!("/api/users/{}/follow", bob_name);
    let follow_req = Request::builder()
        .method(http::Method::POST)
        .uri(follow_uri)
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", alice_token),
        )
        .body(Body::empty())
        .unwrap();
    app.clone().oneshot(follow_req).await.unwrap();

    // 3. Alice が Bob のプロフィールを取得する
    let get_uri = format!("/api/users/{}", bob_name);
    let get_req = Request::builder()
        .method(http::Method::GET)
        .uri(get_uri)
        .header(
            http::header::AUTHORIZATION,
            format!("Bearer {}", alice_token),
        )
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(get_req).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = http_body_util::BodyExt::collect(response.into_body())
        .await
        .unwrap()
        .to_bytes();
    let body_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();

    // 検証: Bobの情報が正しく取れているか
    assert_eq!(body_json["username"], bob_name);
    assert_eq!(body_json["is_self"], false);
    assert_eq!(body_json["is_following"], true); // フォロー済みなので true
    assert_eq!(body_json["follower_count"], 1); // フォロワー数が 1 になっているはず
}

#[sqlx::test]
async fn test_get_profile_not_found(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    let (_username, token) = common::create_test_user(&app).await;

    // 存在しないユーザー名を指定
    let request = Request::builder()
        .method(http::Method::GET)
        .uri("/api/users/non_existent_user_999")
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();

    // 404 Not Found が返るはず (または実装によっては 500/400 ですが、今回は UserNotFound を返すので一般的に 404 か 400)
    // エラー定義で UserNotFound が 404 になっているか確認が必要ですが、
    // もし 400 (BadRequest) に設定している場合はここを BAD_REQUEST に変えてください
    // 一般的には「ユーザーが見つからない」は 404 (NOT_FOUND) が適切です
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[sqlx::test]
async fn test_search_users_pagination_and_sort(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;

    // 1. テストデータを準備 (自分 + 他人3人)
    let (_me_name, token) = common::create_test_user(&app).await;

    // Aさん: 古いユーザー
    let (user_a, _) = common::create_test_user(&app).await;
    // Bさん: 新しいユーザー
    let (user_b, _) = common::create_test_user(&app).await;
    // Cさん: 新しいユーザーだが、名前でフィルタされる予定
    let (user_c, _) = common::create_test_user(&app).await;

    // --- テスト1: デフォルトソート (作成日時が新しい順) ---
    // UserB -> UserC -> UserA のような順序になるはず（作成順によるので厳密にはIDやTime依存）
    // ここではLIMIT 1 でページングを確認
    let uri = "/api/users?limit=1&page=1";
    let request = Request::builder()
        .method(http::Method::GET)
        .uri(uri)
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = http_body_util::BodyExt::collect(response.into_body())
        .await
        .unwrap()
        .to_bytes();
    let users: Vec<serde_json::Value> = serde_json::from_slice(&body_bytes).unwrap();

    assert_eq!(users.len(), 1, "1件だけ取得できること");
    // 最新のユーザー(最後に作ったuser_c)が来ているはず
    assert_eq!(users[0]["username"], user_c);

    // --- テスト2: 2ページ目 (limit=1, page=2) ---
    let uri = "/api/users?limit=1&page=2";
    let request = Request::builder()
        .method(http::Method::GET)
        .uri(uri)
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    let users: Vec<serde_json::Value> = serde_json::from_slice(
        &http_body_util::BodyExt::collect(response.into_body())
            .await
            .unwrap()
            .to_bytes(),
    )
    .unwrap();

    assert_eq!(users.len(), 1);
    // 2番目に新しい user_b が来るはず
    assert_eq!(users[0]["username"], user_b);

    // --- テスト3: 名前検索 (q=user_aの名前の一部) ---
    // user_aの名前の一部を使って検索
    let uri = format!("/api/users?q={}", user_a);
    let request = Request::builder()
        .method(http::Method::GET)
        .uri(uri)
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .body(Body::empty())
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    let users: Vec<serde_json::Value> = serde_json::from_slice(
        &http_body_util::BodyExt::collect(response.into_body())
            .await
            .unwrap()
            .to_bytes(),
    )
    .unwrap();

    assert!(!users.is_empty());
    assert_eq!(
        users[0]["username"], user_a,
        "検索したユーザーだけがヒットすること"
    );
}

// tests/user_test.rs

#[sqlx::test]
async fn test_update_profile_success(pool: sqlx::PgPool) {
    let app = common::setup_app(pool.clone()).await;
    let (username, token) = common::create_test_user(&app).await;

    // 1. プロフィール更新リクエスト (display_name と bio を更新)
    let update_body = serde_json::json!({
        "display_name": "Rust Ace",
        "bio": "Hello Rust World!",
        // icon_url は送らない (None) -> 変更されないはず
    });

    let request = Request::builder()
        .method(http::Method::PUT)
        .uri("/api/user")
        .header(http::header::AUTHORIZATION, format!("Bearer {}", token))
        .header(http::header::CONTENT_TYPE, "application/json")
        .body(Body::from(serde_json::to_vec(&update_body).unwrap()))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    // 2. 更新結果の確認 (DBを直接見るのが確実です)
    let updated_user = sqlx::query!(
        "SELECT display_name, bio, icon_url FROM users WHERE username = $1",
        username
    )
    .fetch_one(&pool)
    .await
    .unwrap();

    assert_eq!(updated_user.display_name.as_deref(), Some("Rust Ace"));
    assert_eq!(updated_user.bio.as_deref(), Some("Hello Rust World!"));
    assert_eq!(updated_user.icon_url, None); // 送っていないのでNULLのまま
}
