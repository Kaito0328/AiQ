import { ApiError, ErrorCodeType } from './error';

export const getApiBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    
    // Only attempt dynamic host resolution on the client side
    if (typeof window !== 'undefined') {
        const isDefaultLocal = envUrl.includes('localhost') || envUrl.includes('127.0.0.1');
        const currentHost = window.location.hostname;
        
        // If we are accessing via an IP or custom domain, but the config points to localhost,
        // we should try to use the current host instead.
        if (isDefaultLocal && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
            try {
                const urlObj = new URL(envUrl);
                return `http://${currentHost}:${urlObj.port || '8080'}`;
            } catch {
                return `http://${currentHost}:8080`;
            }
        }
    }
    
    return envUrl;
};
const API_BASE_URL = getApiBaseUrl();
const API_PREFIX = '/api';

interface RequestOptions extends RequestInit {
    authenticated?: boolean;
}

/**
 * バックエンド API と通信するための共通関数です。
 * サーバーサイド (RSC) とクライアントサイドの両方で動作します。
 */
export async function apiClient<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { authenticated = false, headers: customHeaders, ...rest } = options;

    const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
    const headers = new Headers(customHeaders);

    if (!headers.has('Content-Type') && !(rest.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    // クライアントサイドでのみトークンを付与 (Next.js server-side では別の方法で管理が必要)
    if (authenticated && typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    // タイムアウト設定 (デフォルト30秒)
    const timeout = 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // 手動オフラインモードのチェック
    if (typeof window !== 'undefined' && localStorage.getItem('aiq_manual_offline') === 'true') {
        clearTimeout(timeoutId);
        throw new ApiError(503, {
            code: ErrorCodeType.UNKNOWN_ERROR,
            message: 'Manual offline mode is enabled',
        });
    }

    try {
        const response = await fetch(url, {
            ...rest,
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            throw new ApiError(response.status, {
                code: (errorData.code as ErrorCodeType) || ErrorCodeType.UNKNOWN_ERROR,
                message: errorData.message || 'An unexpected error occurred.',
            });
        }

        // 204 No Content 等のボディがないケースの対応
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');

        if (
            response.status === 204 ||
            contentLength === '0' ||
            (contentType && !contentType.includes('application/json'))
        ) {
            return {} as T;
        }

        const text = await response.text();
        if (!text) {
            return {} as T;
        }

        return JSON.parse(text);
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof ApiError) {
            throw error;
        }

        // タイムアウト特有のエラーハンドリング
        if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiError(408, {
                code: ErrorCodeType.TIMEOUT,
                message: 'Request timed out. The server may be starting up.',
            });
        }

        // ネットワークエラー等
        throw new ApiError(500, {
            code: ErrorCodeType.UNKNOWN_ERROR,
            message: error instanceof Error ? error.message : 'Network error',
        });
    }
}
