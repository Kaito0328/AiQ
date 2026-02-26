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
    data: { items: QuestionInput[] }
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
