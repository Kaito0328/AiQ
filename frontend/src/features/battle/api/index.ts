import { apiClient } from '@/src/shared/api/apiClient';

export interface CreateMatchRoomRequest {
    collectionIds: string[];
    filterTypes: string[];
    sortKeys: string[];
    totalQuestions: number;
    maxBuzzesPerRound: number;
}

export interface CreateMatchRoomResponse {
    roomId: string;
    joinToken: string;
}

export const createMatchRoom = async (req: CreateMatchRoomRequest): Promise<CreateMatchRoomResponse> => {
    return await apiClient<CreateMatchRoomResponse>('/match/room', {
        method: 'POST',
        body: JSON.stringify(req),
        authenticated: true,
    });
};

export const getMatchWsUrl = (roomId: string): string => {
    // API_BASE_URL (http://localhost:8080等) を取得
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // http:// -> ws://, https:// -> wss:// に変換
    const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws');

    return `${wsBaseUrl}/api/ws/match/${roomId}`;
};
