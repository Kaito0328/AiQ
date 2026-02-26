import { Question } from './question';

// ==========================================
// Quiz Types (matching backend snake_case responses)
// ==========================================

export interface CasualQuiz {
    id: string;
    collectionNames: string[];
    totalQuestions: number;
    questionIds: string[];
    answeredQuestionIds: string[];
    correctCount: number;
    elapsedTimeMillis: number;
    isActive: boolean;
    createdAt: string;
}

export interface QuizStartResponse {
    quiz: CasualQuiz;
    questions: Question[];
}

export interface AnswerHistory {
    correct: boolean;
    userAnswer: string;
    question: Question;
}

export interface AnswerRequest {
    questionId: string;
    userAnswer: string;
    elapsedMillis: number;
}

export interface RankingAnswerRequest {
    questionId: string;
    answer: string;
    timeTakenMillis: number;
}

export interface RankingAnswerResponse {
    isCorrect: boolean;
    correctAnswer: string;
    descriptionText?: string;
    nextQuestion?: {
        id: string;
        questionText: string;
    };
    isCompleted: boolean;
    result?: RankingQuizResult;
}

export interface RankingQuizResult {
    quizId: string;
    collectionId: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    totalTimeMillis: number;
    completedAt: string;
}

export interface QuizResumeResponse {
    quiz: CasualQuiz;
    questions: Question[];
    answers: {
        questionId: string;
        userAnswer: string | null;
        isCorrect: boolean;
    }[];
}

// ==========================================
// Filter / Sort Options
// ==========================================

export enum FilterType {
    WRONG_COUNT = 'WRONG_COUNT',
    NOT_SOLVED = 'NOT_SOLVED',
}

export enum SortKey {
    ID = 'ID',
    RANDOM = 'RANDOM',
    WRONG = 'WRONG',
    ACCURACY = 'ACCURACY',
}

export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export const filterTypeLabels: Record<FilterType, string> = {
    [FilterType.WRONG_COUNT]: '間違えた回数',
    [FilterType.NOT_SOLVED]: '未解答',
};

export const sortKeyLabels: Record<SortKey, string> = {
    [SortKey.ID]: 'ID順',
    [SortKey.RANDOM]: 'ランダム',
    [SortKey.WRONG]: '間違いが多い順',
    [SortKey.ACCURACY]: '正答率順',
};

export interface FilterCondition {
    type: FilterType;
    value?: number;
}

export interface SortCondition {
    key: SortKey;
    direction?: SortDirection;
}

// Frontend-friendly request (will be converted to snake_case at API layer)
export interface QuizRequest {
    collectionIds: string[];
    collectionSetId?: string;
    filters: FilterCondition[];
    sorts: SortCondition[];
    limit: number;
}
