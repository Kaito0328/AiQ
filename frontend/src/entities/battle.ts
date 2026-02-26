export interface MatchQuestion {
    id: string; // Uuid
    question_text: string;
    description_text?: string;
}


export interface PlayerScore {
    user_id: string;
    username: string;
    score: number;
}

export type RoomStatus = 'Waiting' | 'Playing' | 'Finished';

export interface MatchRoom {
    room_id: string; // Uuid
    host_id: string; // Uuid
    status: RoomStatus;
    players: PlayerScore[];
}

// WebSocket Messages (Client -> Server)
export type WsClientMessage =
    | { type: 'JoinRoom'; room_id: string; join_token: string }
    | { type: 'StartMatch' }
    | { type: 'Buzz' }
    | { type: 'SubmitAnswer'; answer: string }
    | { type: 'UpdateConfig'; max_buzzes: number }
    | { type: 'BackToLobby' }
    | { type: 'ResetMatch'; collection_ids: string[]; filter_types: string[]; sort_keys: string[]; total_questions: number };

// WebSocket Messages (Server -> Client)
export type WsServerMessage =
    | { type: 'Error'; message: string }
    | { type: 'RoomStateUpdate'; players: PlayerScore[]; host_id: string; status: RoomStatus }
    | { type: 'MatchStarted'; questions: MatchQuestion[]; max_buzzes: number; total_questions: number }
    | { type: 'RoundStarted'; question_index: number; expires_at_ms: number }
    | { type: 'PlayerBuzzed'; user_id: string; expires_at_ms: number }
    | { type: 'AnswerResult'; user_id: string; is_correct: boolean; new_score: number }
    | { type: 'RoundResult'; correct_answer: string; scores: PlayerScore[] }
    | { type: 'MatchResult'; final_scores: PlayerScore[] }
    | { type: 'RoomConfigUpdated'; max_buzzes: number }
    | { type: 'Joined'; user_id: string; username: string };
