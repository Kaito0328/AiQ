use axum::http::HeaderValue;
use backend::app;
use backend::services::seed_service::seed_data;
use backend::state::AppState;
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    dotenv().ok();

    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend=info,tower_http=info".into()),
        )
        .init();

    // Initialize centralized application configuration
    backend::config::init();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to Postgres");

    // Run database migrations
    sqlx::migrate!()
        .run(&pool)
        .await
        .expect("Failed to run database migrations");

    // Seed the database with official user and data if it doesn't exist
    seed_data(&pool).await;

    let state = AppState::new(pool);

    // Spawn background task to clean up empty rooms
    backend::services::match_ws_service::MatchWsService::spawn_cleanup_task(state.match_state.clone());

    // Create CORS layer
    let frontend_url = env::var("FRONTEND_URL").unwrap_or_else(|_| "*".to_string());

    let cors = if frontend_url == "*" {
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any)
    } else {
        CorsLayer::new()
            .allow_origin(frontend_url.parse::<HeaderValue>().unwrap())
            .allow_methods(Any)
            .allow_headers(Any)
    };

    let router = app(state.clone()).layer(cors);

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("Server started on {}", addr);
    axum::serve(listener, router).await.unwrap();
}
