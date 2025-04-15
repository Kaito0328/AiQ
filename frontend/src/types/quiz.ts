export interface UserAnswerRequest {
  questionId: number; // 質問ID
  userAnswer: string; // ユーザーの回答
}

export interface Quiz {
  id: number;
  questionText: string;
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
