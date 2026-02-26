// モジュールを pub にして外部(テスト)からアクセスできるようにする
pub mod dtos;
pub mod error;
pub mod extractors;
pub mod handlers;
pub mod models;
pub mod repositories;
pub mod services;
pub mod state;
pub mod utils; // 追加: extractors モジュールを公開

use axum::{
    Router,
    routing::{delete, get, post, put},
};
use state::AppState;

// ルーターの構築部分をライブラリとして提供する
pub fn app(state: AppState) -> Router {
    Router::new()
        .route("/health", get(|| async { "OK" }))
        .route("/api/auth/register", post(handlers::user_handler::register))
        .route("/api/auth/login", post(handlers::user_handler::login))
        .route("/api/auth/me", get(handlers::user_handler::get_me))
        .route(
            "/api/users/{user_id}/follow",
            post(handlers::follow_handler::follow_user),
        )
        .route(
            "/api/users/{user_id}/follow",
            delete(handlers::follow_handler::unfollow_user),
        )
        .route(
            "/api/users/{user_id}/followers",
            get(handlers::follow_handler::get_followers),
        )
        .route(
            "/api/users/{user_id}/followees",
            get(handlers::follow_handler::get_followees),
        )
        .route(
            "/api/users/official",
            get(handlers::user_handler::get_official_user),
        )
        .route(
            "/api/users/{user_id}",
            get(handlers::user_handler::get_profile),
        )
        .route("/api/users", get(handlers::user_handler::get_users))
        .route(
            "/api/user/password",
            put(handlers::user_handler::change_password),
        )
        .route("/api/user", put(handlers::user_handler::update_profile))
        .route(
            "/api/timeline/followees",
            get(handlers::collection_handler::get_followee_collections),
        )
        .route(
            "/api/timeline/recent",
            get(handlers::collection_handler::get_recent_collections),
        )
        .route(
            "/api/collections/batch",
            post(handlers::collection_handler::batch_collections),
        )
        .route(
            "/api/collections",
            post(handlers::collection_handler::create_collection),
        )
        .route(
            "/api/collections/{collection_id}",
            get(handlers::collection_handler::get_collection),
        )
        .route(
            "/api/collections/{collection_id}",
            put(handlers::collection_handler::update_collection),
        )
        .route(
            "/api/collections/{collection_id}",
            delete(handlers::collection_handler::delete_collection),
        )
        // 特定ユーザーの作成した問題集一覧
        .route(
            "/api/users/{user_id}/collections",
            get(handlers::collection_handler::get_user_collections),
        )
        // ==========================================
        // Question (問題) Routes
        // ==========================================
        // 問題の追加と一覧取得は「どの問題集か」を指定する
        .route(
            "/api/collections/{collection_id}/questions",
            post(handlers::question_handler::create_question),
        )
        .route(
            "/api/collections/{collection_id}/questions",
            get(handlers::question_handler::get_collection_questions),
        )
        .route(
            "/api/collections/{collection_id}/questions/batch",
            post(handlers::question_handler::batch_questions),
        )
        // 更新と削除は問題のIDを直接指定する
        .route(
            "/api/questions/{question_id}",
            put(handlers::question_handler::update_question),
        )
        .route(
            "/api/questions/{question_id}",
            delete(handlers::question_handler::delete_question),
        )
        // ==========================================
        // Collection Set (まとめ枠) Routes
        // ==========================================
        .route(
            "/api/collection-sets",
            post(handlers::collection_set_handler::create_set),
        )
        .route(
            "/api/collection-sets/{set_id}",
            get(handlers::collection_set_handler::get_set),
        )
        .route(
            "/api/collection-sets/{set_id}",
            put(handlers::collection_set_handler::update_set),
        )
        .route(
            "/api/collection-sets/{set_id}",
            delete(handlers::collection_set_handler::delete_set),
        )
        // 特定ユーザーの作成したまとめ枠一覧
        .route(
            "/api/users/{user_id}/collection-sets",
            get(handlers::collection_set_handler::get_user_sets),
        )
        // まとめ枠への問題集の追加・削除
        .route(
            "/api/collection-sets/{set_id}/collections",
            post(handlers::collection_set_handler::add_collection_to_set),
        )
        .route(
            "/api/collection-sets/{set_id}/collections/{collection_id}",
            delete(handlers::collection_set_handler::remove_collection_from_set),
        )
        // ==========================================
        // Quiz Routes
        // ==========================================
        .route(
            "/api/quiz/start",
            post(handlers::quiz_handler::start_casual_quiz),
        )
        .route(
            "/api/quiz/{quiz_id}/submit",
            post(handlers::quiz_handler::submit_answer),
        )
        .route(
            "/api/quiz/resumes",
            get(handlers::quiz_handler::get_resumes),
        )
        .route(
            "/api/quiz/{quiz_id}/resume",
            get(handlers::quiz_handler::resume_quiz),
        )
        // ==========================================
        // Favorite Collection Routes
        // ==========================================
        .route(
            "/api/users/{user_id}/favorites",
            get(handlers::favorite_collection_handler::list_favorites),
        )
        .route(
            "/api/collections/{collection_id}/favorite",
            post(handlers::favorite_collection_handler::add_favorite),
        )
        .route(
            "/api/collections/{collection_id}/favorite",
            delete(handlers::favorite_collection_handler::remove_favorite),
        )
        // ==========================================
        // Ranking Quiz Routes
        // ==========================================
        .route(
            "/api/ranking-quiz/start",
            post(handlers::ranking_quiz_handler::start_ranking_quiz),
        )
        .route(
            "/api/ranking-quiz/{quiz_id}/submit",
            post(handlers::ranking_quiz_handler::submit_ranking_answer),
        )
        .route(
            "/api/ranking-quiz/{quiz_id}/submit-all",
            post(handlers::ranking_quiz_handler::submit_ranking_all_answers),
        )
        .route(
            "/api/collections/{collection_id}/leaderboard",
            get(handlers::ranking_quiz_handler::get_leaderboard),
        )
        .route(
            "/api/ws/generate/collection/{collection_id}",
            get(handlers::ai_handler::generate_ai_questions_ws),
        )
        // ==========================================
        // Competitive Play Match Routes
        // ==========================================
        .route(
            "/api/match/room",
            post(handlers::match_handler::create_room),
        )
        .route(
            "/api/ws/match/{room_id}",
            get(handlers::match_ws_handler::ws_handler),
        )
        .with_state(state)
}
