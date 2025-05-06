import { AnswerHistory } from './answerHistory';
import { Question } from './question';

export interface UserAnswerRequest {
  questionId: number; // 質問ID
  userAnswer: string; // ユーザーの回答
}

export interface QuizAnswerRequest {
  id: number;
  userAnswer: string;
}

export interface QuizAnswerResponse {
  correct: boolean;
  correctAnswer: string;
  description: string;
}

export type AnswerRequest = {
  questionId: number;
  userAnswer: string;
  correct: boolean;
};

export type CasualQuiz = {
  quizId: number;
  collectionNames: string[];
  filterTypes: FilterType[];
  sortKeys: SortKey[];
  totalQuestions: number;
  remainingQuestions: number;
  startTime: string;
};

export type QuizStartResponse = {
  quiz: CasualQuiz;
  questions: Question[];
};

export type QuizResumeResponse = {
  questions: Question[];
  answers: AnswerHistory[];
};

export type FilterType = 'WRONG_COUNT' | 'NOT_SOLVED';

export type SortKey = 'ID' | 'RANDOM' | 'WRONG' | 'ACCURACY';
export type SortDirection = 'ASC' | 'DESC';

export const filterTypeLabels: Record<FilterType, string> = {
  WRONG_COUNT: '間違えた回数',
  NOT_SOLVED: '未解答',
};

export const sortKeyLabels: Record<SortKey, string> = {
  ID: 'ID順',
  RANDOM: 'ランダム',
  WRONG: '間違いが多い順',
  ACCURACY: '正答率順',
};

export type FilterCondition = {
  type: FilterType;
  value?: number;
};

export type SortCondition = {
  key: SortKey;
  direction: SortDirection;
};

export type QuizRequest = {
  collectionIds: number[];
  filters: FilterCondition[];
  sorts: SortCondition[];
  limit: number;
};
