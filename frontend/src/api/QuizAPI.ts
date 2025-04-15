import { fetchFromAPI } from './api';
import { QuestionAnswerResponse } from '../types/types';
import { Quiz, QuizAnswerRequest, QuizAnswerResponse } from '../types/quiz';

export const checkAnswer = async (id: number, userAnswer: string): Promise<QuizAnswerResponse> => {
  const response = await fetchFromAPI(
    `/quiz/${id}/check`,
    {
      method: 'POST',
      body: JSON.stringify({ userAnswer }),
    },
    true,
  );
  return response.json();
};

export const checkAnswers = async (
  request: QuizAnswerRequest[],
): Promise<QuestionAnswerResponse[]> => {
  const response = await fetchFromAPI(
    `/quizs/check`,
    {
      method: 'POST',
      body: JSON.stringify({ request }),
    },
    true,
  );
  return response.json();
};

export const getNextHint = async (questionId: number, index: number): Promise<string> => {
  const response = await fetchFromAPI(
    `/quiz/${questionId}/hint?index=${index}`,
    { method: 'GET' },
    true,
  );
  return response.text();
};

export const getQuestionIds = async (
  collectionIds: number[],
  order: string,
  limit: number,
): Promise<Quiz[]> => {
  const params = new URLSearchParams();
  params.append('collectionIds', collectionIds.join(','));
  params.append('order', order); // 'asc', 'desc', 'random'
  params.append('limit', limit.toString());

  // クエリパラメータをURLに付加
  const url = `/quizs/questions?${params.toString()}`;

  const response = await fetchFromAPI(
    url,
    {
      method: 'GET',
    },
    true,
  );

  return await response.json();
};
