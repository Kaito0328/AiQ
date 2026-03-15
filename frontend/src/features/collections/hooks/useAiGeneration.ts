"use client"
import { logger } from '@/src/shared/utils/logger';
import { getApiBaseUrl } from '@/src/shared/api/apiClient';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface GeneratedQuestion {
    id?: string;
    questionText: string;
    correctAnswers: string[];
    distractors: string[];
    descriptionText?: string | null;
}

export interface GenerateQuestionsRequest {
    prompt: string;
    count?: number;
    pdfData?: string; // base64
    questionFormat?: string;
    answerFormat?: string;
    exampleQuestion?: string;
    exampleAnswer?: string;
    explanationLanguage?: string;
}

export interface WsMessage {
    status: 'processing' | 'saving' | 'completed' | 'error';
    message: string;
    data?: GeneratedQuestion[];
}

export function useAiGeneration(collectionId: string) {
    const [status, setStatus] = useState<'idle' | 'processing' | 'saving' | 'completed' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    const generate = useCallback((request: GenerateQuestionsRequest) => {
        if (!collectionId) return;

        setStatus('processing');
        setMessage('AI生成を開始しています...');
        setGeneratedQuestions([]);

        const apiBaseUrl = getApiBaseUrl();
        const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws');
        const token = localStorage.getItem('token');

        const url = `${wsBaseUrl}/api/ws/generate/collection/${collectionId}${token ? `?token=${token}` : ''}`;
        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify(request));
        };

        ws.onmessage = (event) => {
            try {
                const data: WsMessage = JSON.parse(event.data);
                setStatus(data.status);
                setMessage(data.message);

                if (data.status === 'completed' && data.data) {
                    setGeneratedQuestions(data.data);
                }
            } catch (e) {
                logger.error('Failed to parse AI WS message', e);
                setStatus('error');
                setMessage('通信エラーが発生しました');
            }
        };

        ws.onerror = () => {
            setStatus('error');
            setMessage('WebSocket接続エラーが発生しました');
        };

        ws.onclose = () => {
            // Keep status as is (completed or error)
        };
    }, [collectionId]);

    const reset = useCallback(() => {
        setStatus('idle');
        setMessage('');
        setGeneratedQuestions([]);
        if (socketRef.current) {
            socketRef.current.close();
        }
    }, []);

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    return {
        generate,
        reset,
        status,
        message,
        generatedQuestions
    };
}
