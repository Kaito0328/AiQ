import { ApiError } from './error';

/**
 * エラーがオフライン/ネットワーク到達不可能であるかを判定します。
 * 各フックで重複する判定ロジックを統一するためのヘルパーです。
 *
 * - status === 0: ネットワーク到達不可能（fetch失敗、DNS解決失敗等）
 * - status === 503: サーバー利用不可（メンテナンス、手動オフラインモード等）
 * - status === 408: リクエストタイムアウト
 */
export function isOfflineError(err: unknown): boolean {
    if (err instanceof ApiError) {
        return err.status === 0 || err.status === 503 || err.status === 408;
    }
    return false;
}
