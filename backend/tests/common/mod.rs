use axum::Router;
use backend::{app, state::AppState};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;

pub async fn setup_app() -> Router {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .connect(&database_url)
        .await
        .unwrap();
    let state = AppState { db: pool };
    app(state)
}