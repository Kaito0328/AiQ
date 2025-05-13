import { ApiError } from '../types/error';

// API_BASE_URL を環境変数から取得するように変更
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'; // ローカルデフォルト値を設定
// https://mechanical-annabel-t-tech-f1b7cf63.koyeb.app
const API_ENDPOINT = '/api';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchFromAPI = async (
  endpoint: string,
  options: RequestInit = {},
  authenticated: boolean = false,
  useDefaultContentType: boolean = true,
): Promise<Response> => {
  const token = authenticated ? localStorage.getItem('token') : null;
  const headers = new Headers(options.headers || {});
  console.log('Fetching from API:', `${API_BASE_URL}${API_ENDPOINT}${endpoint}`);

  if (useDefaultContentType) {
    headers.append('Content-Type', 'application/json');
  }

  if (authenticated && token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  try {
    await sleep(1000);
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // カスタムエラーオブジェクトを作成
      const error: ApiError = {
        status: response.status,
        errorCode: {
          code: errorData.code || 'UNKNOWN_ERROR',
          message: errorData.message || 'An unexpected error occurred.',
        },
      };

      throw error; // 呼び出し元にエラーを投げる
    }

    return await response;
  } catch (error: unknown) {
    console.error('API Error:', error);
    throw error; // 呼び出し元で処理するために再スロー
  }
};
