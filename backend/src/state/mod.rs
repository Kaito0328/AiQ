pub mod match_state;

use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

// アプリケーション全体で共有する状態（DIコンテナのような役割）
#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub match_state: match_state::SharedMatchState,
}

impl AppState {
    pub fn new(db: PgPool) -> Self {
        Self {
            db,
            match_state: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}