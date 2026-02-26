use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;

// クライアントに返すエラーのJSON形式（JavaのErrorResponseに相当）
#[derive(Serialize)]
pub struct ErrorResponse {
    pub code: String,
    pub message: String,
}

// アプリケーション全体で使う独自エラー（JavaのCustomExceptionに相当）
#[derive(Debug)]
pub enum AppError {
    DuplicateUser,
    UserNotFound,
    TargetUserNotFound,
    InvalidPassword,
    Unauthorized(String),
    InternalServerError(String),
    Forbidden(String),
    BadRequest(String),
    CannotFollowSelf,
    CannotUnfollowSelf,
}

pub type Result<T> = std::result::Result<T, AppError>;
// src/error.rs の中の impl IntoResponse for AppError の部分をまるごと書き換えます

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::DuplicateUser => write!(f, "DuplicateUser"),
            AppError::UserNotFound => write!(f, "UserNotFound"),
            AppError::TargetUserNotFound => write!(f, "TargetUserNotFound"),
            AppError::InvalidPassword => write!(f, "InvalidPassword"),
            AppError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            AppError::InternalServerError(msg) => write!(f, "InternalServerError: {}", msg),
            AppError::Forbidden(msg) => write!(f, "Forbidden: {}", msg),
            AppError::BadRequest(msg) => write!(f, "BadRequest: {}", msg),
            AppError::CannotFollowSelf => write!(f, "CannotFollowSelf"),
            AppError::CannotUnfollowSelf => write!(f, "CannotUnfollowSelf"),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        // メッセージ部分をすべて実体（String型）として返すように統一します
        let (status, code, message) = match self {
            AppError::DuplicateUser => (
                StatusCode::CONFLICT,
                "DUPLICATE_USER",
                "すでにそのユーザー名は使われています".to_string(), // .to_string() を追加
            ),
            AppError::UserNotFound => (
                StatusCode::UNAUTHORIZED,
                "NOT_FOUND_USER",
                "ユーザー名またはパスワードが間違っています".to_string(), // .to_string() を追加
            ),
            AppError::TargetUserNotFound => (
                StatusCode::NOT_FOUND,
                "TARGET_USER_NOT_FOUND",
                "指定されたユーザーが見つかりません".to_string(),
            ),
            AppError::InvalidPassword => (
                StatusCode::UNAUTHORIZED,
                "INVALID_PASSWORD",
                "ユーザー名またはパスワードが間違っています".to_string(), // .to_string() を追加
            ),
            AppError::Unauthorized(msg) => (
                StatusCode::UNAUTHORIZED,
                "LOGIN_REQUIRED",
                msg, // 元々Stringなのでそのまま渡す（所有権の移動）
            ),
            AppError::InternalServerError(msg) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                msg, // 元々Stringなのでそのまま渡す（所有権の移動）
            ),
            AppError::Forbidden(msg) => (
                StatusCode::FORBIDDEN,
                "FORBIDDEN",
                msg,
            ),
            AppError::BadRequest(msg) => (
                StatusCode::BAD_REQUEST,
                "BAD_REQUEST",
                msg,
            ),
            AppError::CannotFollowSelf => (
                StatusCode::BAD_REQUEST,
                "CANNOT_FOLLOW_SELF",
                "自分自身をフォローすることはできません".to_string(),
            ),
            AppError::CannotUnfollowSelf => (
                StatusCode::BAD_REQUEST,
                "CANNOT_UNFOLLOW_SELF",
                "自分自身のフォローを解除することはできません".to_string(),
            ),
        };

        // レスポンスのJSONボディを作成
        let body = Json(ErrorResponse {
            code: code.to_string(),
            message, // .to_string() が不要になります
        });

        // ステータスコードとJSONをセットにして返却
        (status, body).into_response()
    }
}

// src/error.rs の一番下に追記します

// sqlxのデータベースエラーを自動的に AppError::InternalServerError に変換するルール
impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::InternalServerError(err.to_string())
    }
}
