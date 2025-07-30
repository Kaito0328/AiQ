import { UserAnswerRequest } from "../types/types";

export const saveAnswer = async (request: UserAnswerRequest): Promise<string> => {
    const response = await fetch('/api/answers/save', {
        method: 'POST',
        body: JSON.stringify(request)  // ユーザーの回答データを送信
    });
    return response.text();
}