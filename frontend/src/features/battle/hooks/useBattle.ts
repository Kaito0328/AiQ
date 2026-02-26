import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchRoom, MatchQuestion, PlayerScore, WsServerMessage, WsClientMessage, RoomStatus } from '@/src/entities/battle';
import { getMatchWsUrl } from '../api';
import { FilterCondition, SortCondition } from '@/src/entities/quiz';

export function useBattle(roomId: string, joinToken: string) {
    const [room, setRoom] = useState<MatchRoom | null>(null);
    const [questions, setQuestions] = useState<MatchQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [buzzedUserId, setBuzzedUserId] = useState<string | null>(null);
    const [lastRoundResult, setLastRoundResult] = useState<{ correct_answer: string; scores: PlayerScore[] } | null>(null);
    const [answerResult, setAnswerResult] = useState<{ user_id: string, is_correct: boolean } | null>(null);
    const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
    const [maxBuzzes, setMaxBuzzes] = useState(2);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [selfId, setSelfId] = useState<string | null>(null);
    const [selfUsername, setSelfUsername] = useState<string | null>(null);

    const socketRef = useRef<WebSocket | null>(null);

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
                            players: data.players
                        });
                        break;

                    case 'MatchStarted':
                        setQuestions(data.questions);
                        setRoom(prev => {
                            if (prev) return { ...prev, status: 'Playing' };
                            return {
                                room_id: roomId,
                                host_id: '',
                                status: 'Playing',
                                players: []
                            };
                        });
                        break;

                    case 'RoundStarted':
                        setCurrentQuestionIndex(data.question_index);
                        setBuzzedUserId(null);
                        setLastRoundResult(null);
                        setExpiresAtMs(data.expires_at_ms);
                        break;

                    case 'PlayerBuzzed':
                        setBuzzedUserId(data.user_id);
                        setExpiresAtMs(data.expires_at_ms);
                        break;

                    case 'AnswerResult':
                        setAnswerResult({ user_id: data.user_id, is_correct: data.is_correct });
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
        lastRoundResult,
        answerResult,
        expiresAtMs,
        maxBuzzes,
        selfId,
        selfUsername,
        error,
        isConnected,
        startMatch,
        buzz,
        submitAnswer,
        updateConfig,
        backToLobby,
        resetMatch
    };
}
