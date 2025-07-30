import { BatchUpsertResponse } from '../types/batchResponse';
import { Question } from '../types/question';
import { API_BASE_URL } from './api';

const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

export const connectWebSocket = (): Promise<BatchUpsertResponse<Question>> => {
  return new Promise<BatchUpsertResponse<Question>>((resolve, reject) => {
    const socket = new WebSocket(`${WS_BASE_URL}/ws`);

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      console.log('Received message:', event.data);

      try {
        const data: BatchUpsertResponse<Question> = JSON.parse(event.data);
        resolve(data); // WebSocketの応答を受け取ったらresolve
      } catch (e) {
        reject('サーバーからの応答が不正です' + e);
      } finally {
        socket.close(); // 通信完了後は WebSocket を閉じる
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      reject('WebSocket の通信に失敗しました');
    };
  });
};
