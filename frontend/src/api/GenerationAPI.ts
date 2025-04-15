import { BatchUpsertResponse } from '../types/batchResponse';
import { Question } from '../types/question';
import { AiGenerationRequest } from '../types/types';
import { fetchFromAPI } from './api';
import { connectWebSocket } from './GenerationWebSocket';

export const aiGenerateQuestions = async (
  collectionId: number,
  request: AiGenerationRequest,
): Promise<BatchUpsertResponse<Question>> => {
  // APIリクエスト
  await fetchFromAPI(
    `/generate/collection/${collectionId}/ai`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    },
    true,
  );
  const data = await connectWebSocket();

  // WebSocketから返されたデータを返す
  return data;
};

export const csvGenerateQuestions = async (
  collectionId: number,
  file: File,
): Promise<BatchUpsertResponse<Question>> => {
  const formData = new FormData();
  formData.append('file', file);

  // 正しいエンドポイントに修正
  const response = await fetchFromAPI(
    `/generate/collection/${collectionId}/csv`,
    {
      method: 'POST',
      body: formData,
    },
    true,
    false,
  );
  const data = await response.json();

  return data;
};
