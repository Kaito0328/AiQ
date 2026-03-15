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

import { startOfflineQuiz } from './offlineStart';
import { db } from '@/src/shared/db/db';

/**
 * カジュアルクイズを開始
 * フロントエンドの camelCase を バックエンドの snake_case に変換して送信
 * ネットワークエラー時は IndexedDB のキャッシュから開始を試みます
 */
export const startCasualQuiz = async (data: QuizRequest): Promise<QuizStartResponse> => {
    try {
        const resp = await apiClient<QuizStartResponse>('/quiz/start', {
            method: 'POST',
            body: JSON.stringify({
                collectionIds: data.collectionIds,
                collectionSetId: data.collectionSetId,
                filterNode: data.filterNode,
                sorts: data.sorts,
                totalQuestions: data.limit,
                preferredMode: data.preferredMode,
                dummyCharCount: data.dummyCharCount,
            }),
            authenticated: true,
        });

        // 成功時: バックグラウンドで自動的にキャッシュを更新（LRU的な挙動の準備）
        // 開発者の意向より、画像等はないため積極的にキャッシュして良い
        if (resp.questions.length > 0) {
            // コレクション情報を取得して保存（簡易版：本来は詳細が必要だが既にあるものを流用）
            // ここでは問題データのみを更新保存する
            const savedAt = Date.now();
            await db.questions.bulkPut(resp.questions.map(q => ({ ...q, savedAt })));
        }

        return resp;
    } catch (err) {
        console.warn('API engagement failed, attempting offline start...', err);
        // ネットワークエラー等の場合に IndexedDB からの起動を試みる
        if (typeof window !== 'undefined' && !navigator.onLine) {
            return await startOfflineQuiz(data);
        }
        
        // サーバーが落ちている場合なども含めてフォールバックを試みる
        try {
            return await startOfflineQuiz(data);
        } catch (offlineErr) {
            // オフラインでも失敗（キャッシュがない）場合は元のエラーを投げる
            throw err;
        }
    }
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
    // オフラインクイズ（サーバーにセッションがないもの）は送信をスキップ
    if (quizId.startsWith('offline-')) {
        return;
    }

    // オフラインまたはマニュアルオフライン時は Outbox に追加
    if (typeof window !== 'undefined' && (localStorage.getItem('aiq_manual_offline') === 'true' || !navigator.onLine)) {
        const { syncManager } = await import('@/src/shared/api/SyncManager');
        await syncManager.addAction('SUBMIT_QUIZ_RESULT', { quizId, data });
        return;
    }

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
    correctAnswer: string; // This is the joined string for display
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
