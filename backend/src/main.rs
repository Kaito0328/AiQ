// 自身のライブラリ(backend)からインポートする
use backend::app;
use backend::state::AppState;
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;

#[tokio::main]
async fn main() {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to Postgres");

    let state = AppState { db: pool };
    let router = app(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("Server started on 0.0.0.0:8080");
    axum::serve(listener, router).await.unwrap();
}