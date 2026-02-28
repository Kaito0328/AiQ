import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchRoom, MatchQuestion, PlayerScore, WsServerMessage, WsClientMessage, RoomStatus, RoomVisibility } from '@/src/entities/battle';
import { getMatchWsUrl } from '../api';
import { FilterCondition, SortCondition } from '@/src/entities/quiz';

export function useBattle(roomId: string, joinToken: string) {
    const [room, setRoom] = useState<MatchRoom | null>(null);
    const [questions, setQuestions] = useState<MatchQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [buzzedUserId, setBuzzedUserId] = useState<string | null>(null);
    const [buzzedUserIds, setBuzzedUserIds] = useState<string[]>([]);
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
    const [roundSummaries, setRoundSummaries] = useState<{
        questionId: string;
        questionText: string;
        correctAnswer: string;
        correctCount: number;
    }[]>([]);

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

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const url = `${getMatchWsUrl(roomId)}${token ? `?token=${token}` : ''}`;
        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            setError(null);
            sendMessage({ type: 'JoinRoom', room_id: roomId, join_token: joinToken });
        };

        ws.onmessage = (event) => {
            console.log('[DEBUG] WS Message received:', event.data);
            try {
                const data: WsServerMessage = JSON.parse(event.data);
                console.log('[DEBUG] Parsed WS Data:', data);

                switch (data.type) {
                    case 'RoomStateUpdate':
                        setRoom({
                            room_id: roomId,
                            host_id: data.host_id,
                            status: data.status,
                            players: data.players,
                            visibility: data.visibility || 'public'
                        });
                        break;

                    case 'MatchStarted':
                        setQuestions(data.questions);
                        setCurrentQuestionIndex(-1); // Safety: reset index
                        setBuzzedUserId(null);
                        setBuzzedUserIds([]);
                        setLastRoundResult(null);
                        setSubmittedUserIds([]);
                        setIsPreparing(true);
                        setRoundSummaries([]); // Reset for new match
                        setRoom(prev => {
                            if (prev) return { ...prev, status: 'Playing' };
                            return {
                                room_id: roomId,
                                host_id: '',
                                status: 'Playing',
                                players: [],
                                visibility: 'public'
                            };
                        });
                        break;

                    case 'RoundStarted':
                        setCurrentQuestionIndex(data.question_index);
                        setBuzzedUserId(null);
                        setBuzzedUserIds([]);
                        setSubmittedUserIds([]);
                        setIsPreparing(false);
                        setLastRoundResult(null);
                        setExpiresAtMs(data.expires_at_ms);

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
                        setSubmittedUserIds(data.submitted_user_ids || []);
                        setExpiresAtMs(data.expires_at_ms);
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
                        break;

                    case 'MatchResult':
                        setRoom(prev => prev ? { ...prev, status: 'Finished', players: data.final_scores } : null);
                        setExpiresAtMs(null);
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
                        console.error('[DEBUG] WS Error message:', data.message);
                        setError(data.message);
                        break;
                }
            } catch (e) {
                console.error('Failed to parse WS message', e);
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
    const updateConfig = useCallback((max_buzzes: number) => sendMessage({ type: 'UpdateConfig', max_buzzes }), [sendMessage]);
    const updateVisibility = useCallback((visibility: RoomVisibility) => sendMessage({ type: 'UpdateVisibility', visibility }), [sendMessage]);
    const backToLobby = useCallback(() => sendMessage({ type: 'BackToLobby' }), [sendMessage]);
    const resetMatch = useCallback((collection_ids: string[], filters: FilterCondition[], sorts: SortCondition[], total_questions: number) =>
        sendMessage({
            type: 'ResetMatch',
            collection_ids,
            filter_types: filters.map(f => f.type),
            sort_keys: sorts.map(s => s.key),
            total_questions
        }), [sendMessage]);

    return {
        room,
        questions,
        currentQuestionIndex,
        buzzedUserId,
        buzzedUserIds,
        submittedUserIds,
        lastRoundResult,
        answerResult,
        expiresAtMs,
        isPreparing,
        maxBuzzes,
        selfId,
        selfUsername,
        roundSummaries,
        error,
        isConnected,
        startMatch,
        buzz,
        submitAnswer,
        updateConfig,
        updateVisibility,
        backToLobby,
        resetMatch
    };
}
