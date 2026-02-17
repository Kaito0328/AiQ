use sqlx::PgPool;

// アプリケーション全体で共有する状態（DIコンテナのような役割）
#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
}