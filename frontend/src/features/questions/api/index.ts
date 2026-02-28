import { apiClient } from '@/src/shared/api/apiClient';
import { Question, QuestionInput } from '@/src/entities/question';

/**
 * コレクションに含まれる問題一覧を取得
 */
export const getCollectionQuestions = async (collectionId: string): Promise<Question[]> => {
    return await apiClient<Question[]>(`/collections/${collectionId}/questions`, {
        authenticated: true,
    });
};

/**
 * 問題を新規作成
 */
export const createQuestion = async (collectionId: string, data: QuestionInput): Promise<Question> => {
    return await apiClient<Question>(`/collections/${collectionId}/questions`, {
        method: 'POST',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

/**
 * 問題を一括作成・更新
 */
export const batchQuestions = async (
    collectionId: string,
    data: { upsertItems: any[], deleteIds: string[] }
): Promise<Question[]> => {
    return await apiClient<Question[]>(`/collections/${collectionId}/questions/batch`, {
        method: 'POST',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

/**
 * 問題を更新
 */
export const updateQuestion = async (questionId: string, data: QuestionInput): Promise<Question> => {
    return await apiClient<Question>(`/questions/${questionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

/**
 * 問題を削除
 */
export const deleteQuestion = async (questionId: string): Promise<void> => {
    await apiClient<void>(`/questions/${questionId}`, {
        method: 'DELETE',
        authenticated: true,
    });
};
/**
 * 問題の不足している箇所をAIで補完
 */
export const completeQuestions = async (data: { items: any[], complete_description?: boolean }): Promise<Question[]> => {
    return await apiClient<Question[]>(`/ai/complete`, {
        method: 'POST',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

/**
 * 編集リクエストを送信
 */
export const createEditRequest = async (data: {
    questionId: string;
    questionText: string;
    correctAnswers: string[];
    descriptionText?: string;
    reasonId: number;
}): Promise<any> => {
    return await apiClient<any>(`/edit-requests`, {
        method: 'POST',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

/**
 * コレクションに紐づく編集リクエスト一覧を取得
 */
export const getEditRequests = async (collectionId: string): Promise<any[]> => {
    return await apiClient<any[]>(`/collections/${collectionId}/edit-requests`, {
        authenticated: true,
    });
};

/**
 * ログインユーザーがオーナーである問題集への未承認編集リクエスト一覧を取得
 */
export const getMyPendingRequests = async (): Promise<any[]> => {
    return await apiClient<any[]>(`/edit-requests/my-pending`, {
        authenticated: true,
    });
};

/**
 * 編集リクエストの状態を更新
 */
export const updateEditRequestStatus = async (requestId: string, status: 'approved' | 'rejected'): Promise<any> => {
    return await apiClient<any>(`/edit-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        authenticated: true,
    });
};
