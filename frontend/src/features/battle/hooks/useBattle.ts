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
    const [serverOffset, setServerOffset] = useState(0);
    const serverOffsetRef = useRef(0);
    const [reconnectCount, setReconnectCount] = useState(0);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

    const sendMessage = useCallback((msg: WsClientMessage) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        }
    }, []);

    const selfIdRef = useRef<string | null>(null);
    const reconnectCountRef = useRef(0);

    const connect = useCallback(() => {
        if (!roomId) return;

        // Cleanup existing
        if (socketRef.current) {
            socketRef.current.onclose = null; // Prevent retry loop on intentional close
            socketRef.current.onerror = null;
            socketRef.current.close();
            socketRef.current = null;
        }

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
        
        logger.log('[DEBUG] Connecting to WS:', url);
        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
            logger.log('[DEBUG] WS Open');
            setIsConnected(true);
            setIsReconnecting(false);
            reconnectCountRef.current = 0;
            setReconnectCount(0);
            setError(null);
            
            // Send JoinRoom via raw socket to avoid dependency on sendMessage in this scope
            ws.send(JSON.stringify({ type: 'JoinRoom', room_id: roomId, join_token: joinToken }));

            // Start heartbeat
            if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'Ping' }));
                }
            }, 30000);
        };

        ws.onmessage = (event) => {
            try {
                const data: WsServerMessage = JSON.parse(event.data);
                switch (data.type) {
                    case 'Pong':
                        // Heartbeat successful
                        break;

                    case 'Joined':
                        setSelfId(data.user_id);
                        selfIdRef.current = data.user_id;
                        setSelfUsername(data.username);
                        const offset = data.server_now_ms - Date.now();
                        setServerOffset(offset);
                        serverOffsetRef.current = offset;
                        logger.log('[DEBUG] Server time offset calculated:', offset);
                        break;

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
                            // Adjust for offset: client_time = server_time - offset
                            const adjusted: Record<string, number> = {};
                            Object.entries(data.active_buzzers).forEach(([k, v]) => {
                                adjusted[k.toLowerCase()] = v - serverOffsetRef.current;
                            });
                            setActiveBuzzers(adjusted);
                        }
                        break;

                    case 'MatchStarted':
                        if (data.preferred_mode) setPreferredMode(data.preferred_mode);
                        if (data.dummy_char_count) setDummyCharCount(data.dummy_char_count);
                        setConfig(data.config);
                        setRoom(prev => ({
                            room_id: roomId,
                            host_id: prev?.host_id || '',
                            status: 'Playing' as RoomStatus,
                            players: prev?.players || [],
                            visibility: prev?.visibility || 'private',
                            preferred_mode: data.preferred_mode,
                            dummy_char_count: data.dummy_char_count,
                            buzzer_queue: [],
                            config: data.config
                        }));
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
                        // Correct for offset
                        setExpiresAtMs(data.expires_at_ms - serverOffsetRef.current);
                        setPartialAnswers({});
                        setActiveBuzzers({});

                        const q = questionsRef.current[data.question_index];
                        if (q) {
                            setRoundSummaries(prev => [
                                ...prev,
                                {
                                    questionId: q.id,
                                    questionText: q.question_text,
                                    correctAnswer: '',
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
                        if (data.user_id.toLowerCase() === selfIdRef.current?.toLowerCase()) {
                            setActiveBuzzers(prev => {
                                const next = { ...prev };
                                delete next[data.user_id.toLowerCase()];
                                return next;
                            });
                        }
                        setTimeout(() => setAnswerResult(null), 3000);
                        break;

                    case 'RoundResult':
                        setLastRoundResult({
                            correct_answer: data.correct_answer,
                            scores: data.scores
                        });
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

                    case 'RoomConfigUpdated':
                        setMaxBuzzes(data.max_buzzes);
                        break;

                    case 'RoomVisibilityUpdated':
                        setRoom(prev => prev ? { ...prev, visibility: data.visibility } : null);
                        break;

                    case 'Error':
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
            if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
            
            // Reconnection logic
            if (reconnectCountRef.current < 5) {
                setIsReconnecting(true);
                const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 10000);
                logger.log(`[DEBUG] WS Closed. Reconnecting in ${delay}ms... (Attempt ${reconnectCountRef.current + 1})`);
                reconnectTimerRef.current = setTimeout(() => {
                    reconnectCountRef.current += 1;
                    setReconnectCount(reconnectCountRef.current);
                    connect();
                }, delay);
            } else {
                setError('サーバーとの接続が切れました。ホーム画面に戻ります。');
                setTimeout(() => {
                    window.location.href = '/home';
                }, 3000);
            }
        };
    }, [roomId, joinToken]); // connect only depends on critical identifiers

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.onclose = null;
                socketRef.current.onerror = null;
                socketRef.current.close();
            }
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
        };
    }, [connect]);

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
        isReconnecting,
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
