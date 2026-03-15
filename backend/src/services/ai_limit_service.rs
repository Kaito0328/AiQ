use crate::error::{AppError, Result};
use crate::repositories::ai_limit;
use sqlx::PgPool;
use uuid::Uuid;
use std::env;
use sqlx::types::chrono::Utc;

pub struct AiLimitService;

impl AiLimitService {
    /// ユニットを消費可能かチェックし、可能であれば消費する。
    /// 制限を超えている場合は AppError::AiLimitExceeded を返す。
    pub async fn check_and_consume(
        pool: &PgPool,
        user_id: Uuid,
        units_to_consume: f32,
    ) -> Result<()> {
        // 1. 制限除外ユーザーのチェック
        if is_exempt(user_id) {
            return Ok(());
        }

        // 2. 現在の制限情報の取得
        let limit = ai_limit::find_by_user_id(pool, user_id).await?;
        let now = Utc::now();

        let (mut units_used, mut last_reset) = match limit {
            Some(l) => (l.units_used, l.last_reset_at),
            None => (0.0, now),
        };

        // 3. リセットが必要かチェック (AM 0:00 リセット想定)
        // ここではシンプルに前回リセットから24時間経過しているかで判定
        if now.signed_duration_since(last_reset).num_hours() >= 24 {
            units_used = 0.0;
            last_reset = now;
        }

        // 4. 上限チェック
        let daily_limit = get_daily_limit();
        if units_used + units_to_consume > daily_limit {
            return Err(AppError::AiLimitExceeded(format!(
                "本日のAI利用制限（{} ユニット）を超過しました。明日またご利用ください。",
                daily_limit
            )));
        }

        // 5. 更新
        ai_limit::upsert(pool, user_id, units_used + units_to_consume, last_reset).await?;

        Ok(())
    }

    /// 現在の利用状況を取得する
    pub async fn get_usage(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<crate::dtos::ai_dto::AiUsageResponse> {
        let is_exempt = is_exempt(user_id);
        let daily_limit = get_daily_limit();

        let limit = ai_limit::find_by_user_id(pool, user_id).await?;
        let now = Utc::now();

        let units_used = match limit {
            Some(l) => {
                // リセット判定
                if now.signed_duration_since(l.last_reset_at).num_hours() >= 24 {
                    0.0
                } else {
                    l.units_used
                }
            }
            None => 0.0,
        };

        Ok(crate::dtos::ai_dto::AiUsageResponse {
            units_used,
            daily_limit,
            is_exempt,
        })
    }
}

/// 環境変数から制限除外ユーザーを取得して判定する
fn is_exempt(user_id: Uuid) -> bool {
    let exempt_env = env::var("AI_LIMIT_EXEMPT_USERS").unwrap_or_default();
    if exempt_env.is_empty() {
        return false;
    }

    let user_id_str = user_id.to_string();
    exempt_env.split(',').any(|id| id.trim() == user_id_str)
}

/// 1日の上限ユニット数を取得する
fn get_daily_limit() -> f32 {
    env::var("DAILY_AI_UNIT_LIMIT")
        .unwrap_or_else(|_| "200.0".to_string())
        .parse::<f32>()
        .unwrap_or(200.0)
}
