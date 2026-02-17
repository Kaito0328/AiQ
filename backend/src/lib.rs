// モジュールを pub にして外部(テスト)からアクセスできるようにする
pub mod dtos;
pub mod handlers;
pub mod models;
pub mod repositories;
pub mod services;
pub mod state;
pub mod utils;

use axum::{routing::{get, post}, Router};
use state::AppState;

// ルーターの構築部分をライブラリとして提供する
pub fn app(state: AppState) -> Router {
    Router::new()
        .route("/health", get(|| async { "OK" }))
        .route("/api/auth/register", post(handlers::user_handler::register))
        .route("/api/auth/login", post(handlers::user_handler::login))
        .with_state(state)
}