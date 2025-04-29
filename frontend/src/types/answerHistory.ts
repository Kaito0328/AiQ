import { Question } from './question';

export interface AnswerHistory {
  correct: boolean;
  userAnswer: string;
  question: Question;
}
