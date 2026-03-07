use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::OnceLock;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct UserConfig {
    pub username_max_length: usize,
    pub bio_max_length: usize,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct QuizConfig {
    pub question_text_max_length: usize,
    pub answer_max_length: usize,
    pub max_distractors: usize,
    pub description_max_length: usize,
    pub default_dummy_char_count: usize,
    pub max_active_quizzes_casual: i64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct BattleConfig {
    pub default_timer_seconds: u64,
    pub max_players: usize,
    pub post_match_wait_seconds: u64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct CollectionConfig {
    pub name_max_length: usize,
    pub description_max_length: usize,
    pub max_questions_per_collection: usize,
    pub timeline_pagination_default: i64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct SecurityConfig {
    pub jwt_exp_hours: i64,
    pub rate_limit_per_minute: u64,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AppConfig {
    pub user: UserConfig,
    pub quiz: QuizConfig,
    pub battle: BattleConfig,
    pub collection: CollectionConfig,
    pub security: SecurityConfig,
}

pub static CONFIG: OnceLock<AppConfig> = OnceLock::new();

pub fn init() {
    CONFIG.get_or_init(|| {
        let config_path =
            std::env::var("APP_CONFIG_PATH").unwrap_or_else(|_| "../app_config.json".to_string());

        // Try to read from the path, falling back to current directory
        let content = fs::read_to_string(&config_path).unwrap_or_else(|_| {
            fs::read_to_string("app_config.json")
                .expect("Failed to read app_config.json. Please ensure the file exists.")
        });

        let config: AppConfig = serde_json::from_str(&content)
            .expect("Failed to parse app_config.json. Invalid JSON format.");

        tracing::info!("Loaded application configuration from {}", config_path);
        config
    });
}

pub fn get() -> &'static AppConfig {
    CONFIG
        .get()
        .expect("AppConfig is not initialized. Call config::init() first.")
}
