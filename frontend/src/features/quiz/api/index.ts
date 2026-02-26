import { apiClient } from '@/src/shared/api/apiClient';
import {
    QuizRequest,
    QuizStartResponse,
    AnswerRequest,
    CasualQuiz,
    QuizResumeResponse,
    RankingAnswerRequest,
    RankingAnswerResponse,
} from '@/src/entities/quiz';

/**
 * カジュアルクイズを開始
 * フロントエンドの camelCase を バックエンドの snake_case に変換して送信
 */
export const startCasualQuiz = async (data: QuizRequest): Promise<QuizStartResponse> => {
    return await apiClient<QuizStartResponse>('/quiz/start', {
        method: 'POST',
        body: JSON.stringify({
            collectionIds: data.collectionIds,
            collectionSetId: data.collectionSetId,
            filterTypes: data.filters.map(f => f.type),
            sortKeys: data.sorts.map(s => s.key),
            totalQuestions: data.limit,
        }),
        authenticated: true,
    });
};

/**
 * ランキングクイズを開始
 */
export const startRankingQuiz = async (collectionId: string): Promise<QuizStartResponse> => {
    return await apiClient<QuizStartResponse>('/ranking-quiz/start', {
        method: 'POST',
        body: JSON.stringify({ collectionId }),
        authenticated: true,
    });
};

/**
 * クイズの回答を送信
 */
export const submitAnswer = async (quizId: string, data: AnswerRequest): Promise<void> => {
    await apiClient<void>(`/quiz/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
        authenticated: true,
    });
};

/**
 * 再開可能なクイズ一覧を取得
 */
export const getResumableQuizzes = async (): Promise<CasualQuiz[]> => {
    return await apiClient<CasualQuiz[]>('/quiz/resumes', {
        authenticated: true,
    });
};

/**
 * クイズを再開
 */
export const resumeQuiz = async (quizId: string): Promise<QuizResumeResponse> => {
    return await apiClient<QuizResumeResponse>(`/quiz/${quizId}/resume`, {
        authenticated: true,
    });
};

/**
 * ランキングクイズの回答を一括送信
 */
export const submitRankingAllAnswers = async (quizId: string, answers: RankingAnswerRequest[]): Promise<RankingQuizResultDto> => {
    return await apiClient<RankingQuizResultDto>(`/ranking-quiz/${quizId}/submit-all`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
        authenticated: true,
    });
};

/**
 * リーダーボードを取得
 */
export const getLeaderboard = async (collectionId: string): Promise<LeaderboardResponse> => {
    return await apiClient<LeaderboardResponse>(`/collections/${collectionId}/leaderboard`, {
        authenticated: true,
    });
};

export interface RankingAnswerResultDto {
    questionId: string;
    isCorrect: boolean;
    correctAnswer: string;
}

export interface RankingQuizResultDto {
    quizId: string;
    collectionId: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    totalTimeMillis: number;
    completedAt: string;
    rank?: number;
    detailedResults: RankingAnswerResultDto[];
}

export interface LeaderboardEntry {
    userId: string;
    username: string;
    iconUrl?: string;
    score: number;
    rank: number;
}

export interface LeaderboardResponse {
    collectionId: string;
    entries: LeaderboardEntry[];
}
