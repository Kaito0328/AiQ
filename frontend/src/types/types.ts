export interface QuestionAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface AiGenerationRequest {
  theme: string; // テーマ
  question_format: string; // 質問のフォーマット
  answer_format: string; // 答えのフォーマット
  question_example: string; // 質問の例
  answer_example: string;
  question_number: number;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string; // JWT トークン
}

export interface UserAnswerRequest {
  questionId: number;
  userAnswer: string;
  correct: boolean;
}
