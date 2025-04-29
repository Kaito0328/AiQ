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
  filterTypes: string[];
  sortKeys: string[];
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
