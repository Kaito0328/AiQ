import { fetchFromAPI } from './api';
import {
  AnswerRequest,
  CasualQuiz,
  QuizRequest,
  QuizStartResponse,
  QuizResumeResponse,
} from '../types/quiz';

export const submitAnswer = async (quizId: number, answer: AnswerRequest): Promise<void> => {
  await fetchFromAPI(
    `/quiz/${quizId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify(answer),
    },
    true,
  );
};

export const startCasualQuiz = async (quizRequest: QuizRequest): Promise<QuizStartResponse> => {
  const response = await fetchFromAPI(
    '/quiz/start',
    {
      method: 'POST', // もしPOSTで送るなら 'POST' にし、body を付与
      body: JSON.stringify(quizRequest),
    },
    true,
  );
  return response.json();
};

export const deleteQuiz = async (quizId: number): Promise<void> => {
  await fetchFromAPI(
    `/quiz/${quizId}`,
    {
      method: 'DELETE',
    },
    true,
  );
};

export const getResumableQuizzes = async (): Promise<CasualQuiz[]> => {
  const response = await fetchFromAPI(
    '/quiz/resumes',
    {
      method: 'GET',
    },
    true,
  );
  return response.json();
};

export const resumeQuiz = async (quizId: number): Promise<QuizResumeResponse> => {
  const response = await fetchFromAPI(
    `/quiz/${quizId}/resume`,
    {
      method: 'GET',
    },
    true,
  );
  return response.json();
};
