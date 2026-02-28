use axum::{
    body::Body,
    http::{self, Request, StatusCode},
};
use http_body_util::BodyExt;
use tower::ServiceExt;
use uuid::Uuid;

mod common;

#[sqlx::test]
async fn test_favorite_collection_flow(pool: sqlx::PgPool) {
    let app = common::setup_app(pool).await;
    
    // 1. Create a user and a collection (by another user)
    let (me_name, me_token) = common::create_test_user(&app).await;
    let (_other_name, other_token) = common::create_test_user(&app).await;
    
    let collection_id = common::create_test_collection(&app, &other_token, true).await;

    // 2. Add to favorite
    let req_add = Request::builder()
        .method(http::Method::POST)
        .uri(format!("/api/collections/{}/favorite", collection_id))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", me_token))
        .body(Body::empty())
        .unwrap();
    let res_add = app.clone().oneshot(req_add).await.unwrap();
    assert_eq!(res_add.status(), StatusCode::OK);

    // 3. List favorites
    // We need our user UUID. In these tests, we can get it from the profile or by parsing it from somewhere.
    // Let's get "me" profile to get the UUID.
    let req_profile = Request::builder()
        .uri(format!("/api/users/{}", me_name))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", me_token))
        .body(Body::empty())
        .unwrap();
    let res_profile = app.clone().oneshot(req_profile).await.unwrap();
    let body_bytes = res_profile.into_body().collect().await.unwrap().to_bytes();
    let profile_json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let user_id = profile_json.get("id").unwrap().as_str().unwrap();

    let req_list = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/users/{}/favorites", user_id))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", me_token))
        .body(Body::empty())
        .unwrap();
    let res_list = app.clone().oneshot(req_list).await.unwrap();
    assert_eq!(res_list.status(), StatusCode::OK);
    
    let body_bytes = res_list.into_body().collect().await.unwrap().to_bytes();
    let list_json: Vec<serde_json::Value> = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(list_json.len(), 1);
    assert_eq!(list_json[0].get("id").unwrap().as_str().unwrap(), collection_id);

    // 4. Remove from favorite
    let req_remove = Request::builder()
        .method(http::Method::DELETE)
        .uri(format!("/api/collections/{}/favorite", collection_id))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", me_token))
        .body(Body::empty())
        .unwrap();
    let res_remove = app.clone().oneshot(req_remove).await.unwrap();
    assert_eq!(res_remove.status(), StatusCode::OK);

    // 5. Verify it's gone
    let req_list_2 = Request::builder()
        .method(http::Method::GET)
        .uri(format!("/api/users/{}/favorites", user_id))
        .header(http::header::AUTHORIZATION, format!("Bearer {}", me_token))
        .body(Body::empty())
        .unwrap();
    let res_list_2 = app.clone().oneshot(req_list_2).await.unwrap();
    let body_bytes = res_list_2.into_body().collect().await.unwrap().to_bytes();
    let list_json_2: Vec<serde_json::Value> = serde_json::from_slice(&body_bytes).unwrap();
    assert_eq!(list_json_2.len(), 0);
}
