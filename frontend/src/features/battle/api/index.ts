import { apiClient } from '@/src/shared/api/apiClient';
import { FilterType, SortKey } from '@/src/entities/quiz';

export interface CreateMatchRoomRequest {
    collectionIds: string[];
    filterTypes: FilterType[];
    sortKeys: SortKey[];
    totalQuestions: number;
    maxBuzzesPerRound: number;
    visibility?: 'public' | 'private' | 'followers';
}

export interface CreateMatchRoomResponse {
    roomId: string;
    joinToken: string;
}

export interface MatchRoomListItem {
    roomId: string;
    hostId: string;
    hostUsername: string;
    playerCount: number;
    status: string;
    totalQuestions: number;
}

export const createMatchRoom = async (req: CreateMatchRoomRequest): Promise<CreateMatchRoomResponse> => {
    return await apiClient<CreateMatchRoomResponse>('/match/room', {
        method: 'POST',
        body: JSON.stringify(req),
        authenticated: true,
    });
};

export const getPublicRooms = async (): Promise<MatchRoomListItem[]> => {
    return await apiClient<MatchRoomListItem[]>('/match/room', {
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
