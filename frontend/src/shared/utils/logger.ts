/**
 * ログ出力を本番環境で制御するためのユーティリティ
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    /**
     * デバッグ・開発用のログ
     */
    log: (...args: any[]) => {
        if (!isProduction) {
            console.log(...args);
        }
    },

    /**
     * 情報ログ
     */
    info: (...args: any[]) => {
        if (!isProduction) {
            console.info(...args);
        }
    },

    /**
     * 警告ログ
     */
    warn: (...args: any[]) => {
        if (!isProduction) {
            console.warn(...args);
        }
    },

    /**
     * エラーログ（本番環境でも出力に含めるが、将来的に外部サービス送信などに拡張可能）
     */
    error: (...args: any[]) => {
        console.error(...args);
    },

    /**
     * デバッグログ（詳細情報）
     */
    debug: (...args: any[]) => {
        if (!isProduction) {
            console.debug(...args);
        }
    }
};
