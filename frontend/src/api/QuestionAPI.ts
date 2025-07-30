import { fetchFromAPI } from './api';
import { Question, QuestionInput } from '../types/question';
import { BatchUpsertRequest } from '../types/batchRequest';
import { BatchDeleteResponse, BatchUpsertResponse } from '../types/batchResponse';

export const getQuestionById = async (id: number): Promise<Question> => {
  const response = await fetchFromAPI(`/question/${id}`, { method: 'GET' }, true);
  return response.json();
};

export const getQuestions = async (ids: number[]): Promise<Question[]> => {
  const response = await fetchFromAPI(
    `/questions`,
    {
      method: 'GET',
      body: JSON.stringify({ ids }),
    },
    true,
  );
  return response.json();
};

export const getQuestionsByCollectionId = async (collectionId: number): Promise<Question[]> => {
  const response = await fetchFromAPI(
    `/questions/collection/${collectionId}`,
    { method: 'GET' },
    true,
  );
  return response.json();
};

export const createQuestion = async (
  collectionId: number,
  questionInput: QuestionInput,
): Promise<Question> => {
  const response = await fetchFromAPI(
    `/question/collection/${collectionId}`,
    {
      method: 'POST',
      body: JSON.stringify(questionInput),
    },
    true,
  );
  return response.json();
};

export const updateQuestion = async (
  id: number,
  questionInput: QuestionInput,
): Promise<Question> => {
  const response = await fetchFromAPI(
    `/question/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(questionInput),
    },
    true,
  );
  return response.json();
};

export const upsertQuestions = async (
  collectionId: number,
  request: BatchUpsertRequest<QuestionInput>,
): Promise<BatchUpsertResponse<Question>> => {
  const response = await fetchFromAPI(
    `/questions/collection/${collectionId}`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true,
  );
  return response.json();
};

export const deleteQuestion = async (id: number): Promise<Question> => {
  const response = await fetchFromAPI(`question/${id}`, { method: 'DELETE' }, true);
  return response.json();
};

export const deleteQuestions = async (
  ids: number[],
  collectionId: number,
): Promise<BatchDeleteResponse<Question>> => {
  const response = await fetchFromAPI(
    `/questions/collection/${collectionId}`,
    {
      method: 'DELETE',
      body: JSON.stringify(ids),
    },
    true,
  );
  return response.json();
};
