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

export const pdfGenerateQuestions = async (
  collectionId: number,
  file: File,
  theme?: string, // 新しく追加: テーマを渡せるようにする
  numQuestions?: number, // 新しく追加: 質問数を渡せるようにする
): Promise<BatchUpsertResponse<Question>> => {
  const formData = new FormData();
  formData.append('file', file);

  // オプションのパラメータをFormDataに追加
  if (theme) {
    formData.append('theme', theme);
  }
  if (numQuestions) {
    formData.append('numQuestions', numQuestions.toString());
  }

  // PDFアップロード用のエンドポイントに修正
  await fetchFromAPI(
    `/generate/collection/${collectionId}/pdf`, // ここをPDF用のエンドポイントに変更
    {
      method: 'POST',
      body: formData,
    },
    true, // Content-Type は FormData を使うので 'multipart/form-data' になるため、通常は不要だが、fetchFromAPIの実装による
    false, // JSON形式での送信ではない
  );
  const data = await connectWebSocket();

  return data;
};
