import { FilterNode, SortCondition } from './quiz';

export interface MatchQuestion {
  id: string; // Uuid
  question_text: string;
  correct_answers: string[];
  description_text?: string;
  answer_rubis: string[];
  distractors: string[];
  recommended_mode: string;
}

export interface PlayerScore {
  user_id: string;
  username: string;
  score: number;
  icon_url?: string;
}

export type RoomVisibility = "private" | "followers" | "public";

export type RoomStatus = "Waiting" | "Playing" | "Finished";

export interface MatchConfig {
  text_timer_s: number;
  chips_char_timer_s: number;
  choice_timer_s: number;
  base_score: number;
  speed_bonus_max: number; // 1st buzz bonus
  penalty: number; // wrong answer penalty
  first_wrong_penalty: number; // extra penalty for 1st buzzer on wrong
  win_score: number | null; // null = infinite
  post_round_delay_seconds: number;
}

export interface MatchRoom {
  room_id: string; // Uuid
  host_id: string; // Uuid
  status: RoomStatus;
  players: PlayerScore[];
  visibility: RoomVisibility;
  preferred_mode: string;
  dummy_char_count: number;
  buzzer_queue: string[];
  config: MatchConfig;
}

// WebSocket Messages (Client -> Server)
export type WsClientMessage =
  | { type: "JoinRoom"; room_id: string; join_token: string }
  | { type: "StartMatch" }
  | { type: "Buzz" }
  | { type: "SubmitAnswer"; answer: string }
  | { type: "SubmitPartialAnswer"; answer: string }
  | { type: "UpdateConfig"; max_buzzes: number }
  | { type: "BackToLobby" }
  | {
    type: "ResetMatch";
    collection_ids: string[];
    filter_node?: FilterNode;
    sorts: SortCondition[];
    total_questions: number;
    preferred_mode?: string;
    dummy_char_count?: number;
  }
  | { type: "UpdateVisibility"; visibility: RoomVisibility }
  | { type: "UpdateMatchConfig"; config: MatchConfig };

// WebSocket Messages (Server -> Client)
export type WsServerMessage =
  | { type: "Error"; message: string }
  | {
    type: "RoomStateUpdate";
    players: PlayerScore[];
    host_id: string;
    status: RoomStatus;
    visibility?: RoomVisibility;
    preferred_mode: string;
    dummy_char_count: number;
    buzzer_queue: string[];
    config: MatchConfig;
    questions?: MatchQuestion[];
    current_question_index?: number;
    round_sequence?: number;
  }
  | {
    type: "MatchStarted";
    questions: MatchQuestion[];
    max_buzzes: number;
    total_questions: number;
    preferred_mode: string;
    dummy_char_count: number;
    config: MatchConfig;
  }
  | { type: "RoundStarted"; question_index: number; expires_at_ms: number }
  | {
    type: "PlayerBuzzed";
    user_id: string;
    expires_at_ms: number;
    buzzed_user_ids: string[];
    submitted_user_ids: string[];
    buzzer_queue: string[];
  }
  | {
    type: "PartialAnswerUpdate";
    user_id: string;
    answer: string;
    expires_at_ms: number;
  }
  | {
    type: "AnswerResult";
    user_id: string;
    is_correct: boolean;
    new_score: number;
    submitted_user_ids: string[];
  }
  | { type: "RoundResult"; correct_answer: string; scores: PlayerScore[] }
  | { type: "MatchResult"; final_scores: PlayerScore[] }
  | { type: "RoomConfigUpdated"; max_buzzes: number }
  | { type: "RoomVisibilityUpdated"; visibility: RoomVisibility }
  | { type: "Joined"; user_id: string; username: string };
