import { logger } from '@/src/shared/utils/logger';
import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchRoom, MatchQuestion, PlayerScore, WsServerMessage, WsClientMessage, RoomStatus, RoomVisibility, MatchConfig } from '@/src/entities/battle';
import { getMatchWsUrl } from '../api';
import { FilterCondition, SortCondition, FilterNode, SortDirection } from '@/src/entities/quiz';
import AppConfig from '@/src/app_config';

export const DEFAULT_CONFIG: MatchConfig = {
    text_timer_s: 20,
    chips_char_timer_s: 5,
    choice_timer_s: 5,
    base_score: 10,
    speed_bonus_max: 10,
    penalty: 10,
    first_wrong_penalty: 10,
    win_score: 100,
    post_round_delay_seconds: 5,
};

export function useBattle(roomId: string, joinToken: string) {
    const [room, setRoom] = useState<MatchRoom | null>(null);
    const [questions, setQuestions] = useState<MatchQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [buzzedUserId, setBuzzedUserId] = useState<string | null>(null);
    const [buzzedUserIds, setBuzzedUserIds] = useState<string[]>([]);
    const [buzzerQueue, setBuzzerQueue] = useState<string[]>([]);
    const [config, setConfig] = useState<MatchConfig>(DEFAULT_CONFIG);
    const [lastRoundResult, setLastRoundResult] = useState<{ correct_answer: string; scores: PlayerScore[] } | null>(null);
    const [answerResult, setAnswerResult] = useState<{ user_id: string, is_correct: boolean } | null>(null);
    const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
    const [submittedUserIds, setSubmittedUserIds] = useState<string[]>([]);
    const [isPreparing, setIsPreparing] = useState(false);
    const [maxBuzzes, setMaxBuzzes] = useState(2);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [selfId, setSelfId] = useState<string | null>(null);
    const [selfUsername, setSelfUsername] = useState<string | null>(null);
    const [partialAnswers, setPartialAnswers] = useState<Record<string, string>>({}); // user_id -> answer
    const [activeBuzzers, setActiveBuzzers] = useState<Record<string, number>>({}); // user_id -> expires_at_ms
    const [roundSummaries, setRoundSummaries] = useState<{
        questionId: string;
        questionText: string;
        correctAnswer: string;
        correctCount: number;
    }[]>([]);
    const [preferredMode, setPreferredMode] = useState<string>('chips');
    const [dummyCharCount, setDummyCharCount] = useState(AppConfig.quiz.default_dummy_char_count);

    const socketRef = useRef<WebSocket | null>(null);
    const questionsRef = useRef<MatchQuestion[]>([]);

    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

    const sendMessage = useCallback((msg: WsClientMessage) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        }
    }, []);

    useEffect(() => {
        if (!roomId) return;

        // Helper for UUID fallback (non-secure contexts)
        const generateUUID = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        };

        // Guest ID logic: use localStorage for persistence
        let guestId = typeof window !== 'undefined' ? localStorage.getItem('guest_id') : null;
        if (!guestId) {
            guestId = generateUUID();
            if (typeof window !== 'undefined') {
                localStorage.setItem('guest_id', guestId);
            }
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const guestQuery = !token ? `&guest_id=${guestId}` : '';
        const url = `${getMatchWsUrl(roomId)}?${token ? `token=${token}` : ''}${guestQuery}`;
        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setError(null);
            sendMessage({ type: 'JoinRoom', room_id: roomId, join_token: joinToken });
        };

        ws.onmessage = (event) => {
            logger.log('[DEBUG] WS Message received:', event.data);
            try {
                const data: WsServerMessage = JSON.parse(event.data);
                logger.log('[DEBUG] Parsed WS Data:', data);

                switch (data.type) {
                    case 'RoomStateUpdate':
                        setRoom({
                            room_id: roomId,
                            host_id: data.host_id,
                            status: data.status,
                            players: data.players,
                            visibility: data.visibility || 'private',
                            preferred_mode: data.preferred_mode || 'chips',
                            dummy_char_count: data.dummy_char_count || AppConfig.quiz.default_dummy_char_count,
                            buzzer_queue: data.buzzer_queue,
                            config: data.config
                        });
                        setBuzzerQueue(data.buzzer_queue);
                        setConfig(data.config);
                        if (data.preferred_mode) setPreferredMode(data.preferred_mode);
                        if (data.dummy_char_count) setDummyCharCount(data.dummy_char_count);

                        if (data.active_buzzers) {
                            setActiveBuzzers(data.active_buzzers);
                        }
                        break;

                    case 'MatchStarted':
                        // Set mode BEFORE questions so BattleQuiz's mode-fallback effect
                        // sees the correct preferredMode when questions trigger re-renders
                        if (data.preferred_mode) setPreferredMode(data.preferred_mode);
                        if (data.dummy_char_count) setDummyCharCount(data.dummy_char_count);
                        setConfig(data.config);
                        setRoom(prev => {
                            if (prev) return {
                                ...prev,
                                status: 'Playing',
                                preferred_mode: data.preferred_mode,
                                dummy_char_count: data.dummy_char_count,
                                config: data.config
                            };
                            return {
                                room_id: roomId,
                                host_id: '',
                                status: 'Playing',
                                players: [],
                                visibility: 'private',
                                preferred_mode: data.preferred_mode,
                                dummy_char_count: data.dummy_char_count,
                                buzzer_queue: [],
                                config: data.config
                            };
                        });
                        // Set questions last so child effects see the correct mode
                        setQuestions(data.questions);
                        setCurrentQuestionIndex(-1);
                        setBuzzedUserId(null);
                        setBuzzedUserIds([]);
                        setBuzzerQueue([]);
                        setLastRoundResult(null);
                        setSubmittedUserIds([]);
                        setIsPreparing(true);
                        setRoundSummaries([]);
                        setPartialAnswers({});
                        setActiveBuzzers({});
                        break;

                    case 'RoundStarted':
                        setCurrentQuestionIndex(data.question_index);
                        setBuzzedUserId(null);
                        setBuzzedUserIds([]);
                        setBuzzerQueue([]);
                        setSubmittedUserIds([]);
                        setIsPreparing(false);
                        setLastRoundResult(null);
                        setExpiresAtMs(data.expires_at_ms);
                        setPartialAnswers({});
                        setActiveBuzzers({});

                        // Initialize summary for this round
                        const q = questionsRef.current[data.question_index];
                        if (q) {
                            setRoundSummaries(prev => [
                                ...prev,
                                {
                                    questionId: q.id,
                                    questionText: q.question_text,
                                    correctAnswer: '', // Will be filled in RoundResult
                                    correctCount: 0
                                }
                            ]);
                        }
                        break;

                    case 'PlayerBuzzed':
                        setBuzzedUserId(data.user_id);
                        setBuzzedUserIds(data.buzzed_user_ids || []);
                        setBuzzerQueue(data.buzzer_queue || []);
                        setSubmittedUserIds(data.submitted_user_ids || []);
                        if (data.active_buzzers) {
                            const lowered: Record<string, number> = {};
                            Object.entries(data.active_buzzers).forEach(([k, v]) => lowered[k.toLowerCase()] = v);
                            setActiveBuzzers(lowered);
                        }
                        break;

                    case 'PartialAnswerUpdate':
                        setPartialAnswers(prev => ({
                            ...prev,
                            [data.user_id.toLowerCase()]: data.answer
                        }));
                        if (data.active_buzzers) {
                            const lowered: Record<string, number> = {};
                            Object.entries(data.active_buzzers).forEach(([k, v]) => lowered[k.toLowerCase()] = v);
                            setActiveBuzzers(lowered);
                        }
                        break;

                    case 'AnswerResult':
                        setAnswerResult({ user_id: data.user_id, is_correct: data.is_correct });
                        setSubmittedUserIds(data.submitted_user_ids || []);
                        if (data.is_correct) {
                            setRoundSummaries(prev => {
                                const lastIndex = prev.length - 1;
                                if (lastIndex >= 0) {
                                    const last = prev[lastIndex];
                                    const updated = [...prev];
                                    updated[lastIndex] = { ...last, correctCount: last.correctCount + 1 };
                                    return updated;
                                }
                                return prev;
                            });
                        }
                        if (!data.is_correct) {
                            setBuzzedUserId(null);
                        }
                        // Local optimization: remove ourselves from active buzzers if we submitted
                        if (data.user_id.toLowerCase() === selfId?.toLowerCase()) {
                            setActiveBuzzers(prev => {
                                const next = { ...prev };
                                delete next[data.user_id.toLowerCase()];
                                return next;
                            });
                        }
                        // Clear answer result after 3 seconds
                        setTimeout(() => setAnswerResult(null), 3000);
                        break;

                    case 'RoundResult':
                        setLastRoundResult({
                            correct_answer: data.correct_answer,
                            scores: data.scores
                        });

                        // Update correct answer for the current summary
                        setRoundSummaries(prev => {
                            const lastIndex = prev.length - 1;
                            if (lastIndex >= 0) {
                                const updated = [...prev];
                                updated[lastIndex] = { ...updated[lastIndex], correctAnswer: data.correct_answer };
                                return updated;
                            }
                            return prev;
                        });
                        setRoom(prev => prev ? { ...prev, players: data.scores } : null);
                        setExpiresAtMs(null);
                        setBuzzerQueue([]);
                        setActiveBuzzers({});
                        setPartialAnswers({});
                        break;

                    case 'MatchResult':
                        setRoom(prev => prev ? { ...prev, status: 'Finished', players: data.final_scores } : null);
                        setExpiresAtMs(null);
                        setBuzzerQueue([]);
                        setActiveBuzzers({});
                        break;

                    case 'Joined':
                        setSelfId(data.user_id);
                        setSelfUsername(data.username);
                        break;

                    case 'RoomConfigUpdated':
                        setMaxBuzzes(data.max_buzzes);
                        break;

                    case 'RoomVisibilityUpdated':
                        setRoom(prev => prev ? { ...prev, visibility: data.visibility } : null);
                        break;

                    case 'Error':
                        logger.error('[DEBUG] WS Error message:', data.message);
                        setError(data.message);
                        break;
                }
            } catch (e) {
                logger.error('Failed to parse WS message', e);
            }
        };

        ws.onerror = () => {
            setError('WebSocket接続エラーが発生しました');
        };

        ws.onclose = () => {
            setIsConnected(false);
        };

        return () => {
            ws.close();
        };
    }, [roomId, joinToken, sendMessage]);

    const startMatch = useCallback(() => sendMessage({ type: 'StartMatch' }), [sendMessage]);
    const buzz = useCallback(() => sendMessage({ type: 'Buzz' }), [sendMessage]);
    const submitAnswer = useCallback((answer: string) => sendMessage({ type: 'SubmitAnswer', answer }), [sendMessage]);
    const submitPartialAnswer = useCallback((answer: string) => sendMessage({ type: 'SubmitPartialAnswer', answer }), [sendMessage]);
    const updateConfig = useCallback((max_buzzes: number) => sendMessage({ type: 'UpdateConfig', max_buzzes }), [sendMessage]);
    const updateMatchConfig = useCallback((config: MatchConfig) => sendMessage({ type: 'UpdateMatchConfig', config }), [sendMessage]);
    const updateVisibility = useCallback((visibility: RoomVisibility) => sendMessage({ type: 'UpdateVisibility', visibility }), [sendMessage]);
    const backToLobby = useCallback(() => sendMessage({ type: 'BackToLobby' }), [sendMessage]);

    // Explicit reset for better API
    const resetMatchExplicit = useCallback((collection_ids: string[], filterNode: FilterNode | undefined, sorts: SortCondition[], total_questions: number, mode?: string, count?: number) => {
        sendMessage({
            type: 'ResetMatch',
            collection_ids,
            filter_node: filterNode,
            sorts: sorts.map(s => ({ key: s.key, direction: s.direction || SortDirection.ASC })),
            total_questions,
            preferred_mode: mode,
            dummy_char_count: count
        });
    }, [sendMessage]);

    // Explicit update for local reflection of corrections
    const updateLocalQuestion = useCallback((questionId: string, updates: Partial<MatchQuestion>) => {
        setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, ...updates } : q));
    }, []);

    return {
        room,
        questions,
        currentQuestionIndex,
        buzzedUserId,
        buzzedUserIds,
        buzzerQueue,
        submittedUserIds,
        lastRoundResult,
        answerResult,
        expiresAtMs,
        isPreparing,
        maxBuzzes,
        config,
        preferredMode,
        dummyCharCount,
        selfId,
        selfUsername,
        partialAnswers,
        activeBuzzers,
        roundSummaries,
        error,
        isConnected,
        startMatch,
        buzz,
        submitAnswer,
        submitPartialAnswer,
        updateConfig,
        updateMatchConfig,
        updateVisibility,
        backToLobby,
        resetMatch: resetMatchExplicit,
        updateLocalQuestion
    };
}
