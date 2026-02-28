import { ApiError, ErrorCodeType } from './error';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
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

    try {
        const response = await fetch(url, {
            ...rest,
            headers,
        });

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
        if (error instanceof ApiError) {
            throw error;
        }

        // ネットワークエラー等
        throw new ApiError(500, {
            code: ErrorCodeType.UNKNOWN_ERROR,
            message: error instanceof Error ? error.message : 'Network error',
        });
    }
}
