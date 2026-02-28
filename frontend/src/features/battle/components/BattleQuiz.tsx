"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { MatchQuestion, PlayerScore } from '@/src/entities/battle';
import { Trophy, Clock, Zap, MessageSquare, Check, X, Bell } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { View } from '@/src/design/primitives/View';

interface BattleQuizProps {
    question: MatchQuestion;
    buzzedUserId: string | null;
    buzzedUserIds: string[];
    submittedUserIds: string[];
    lastRoundResult: { correct_answer: string; scores: PlayerScore[] } | null;
    players: PlayerScore[];
    selfId: string | null;
    onBuzz: () => void;
    onSubmit: (answer: string) => void;
    expiresAtMs: number | null;
    answerResult: { user_id: string, is_correct: boolean } | null;
    currentQuestionIndex: number;
    totalQuestions: number;
    maxBuzzes: number;
}

export function BattleQuiz({
    question,
    buzzedUserId,
    buzzedUserIds = [],
    submittedUserIds = [],
    lastRoundResult,
    players,
    selfId,
    onBuzz,
    onSubmit,
    expiresAtMs,
    answerResult,
    currentQuestionIndex,
    totalQuestions,
    maxBuzzes
}: BattleQuizProps) {
    const [answer, setAnswer] = useState('');
    const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const isMyBuzzed = buzzedUserIds.some(id => id.toLowerCase() === selfId?.toLowerCase());
    const isMySubmitted = submittedUserIds.some(id => id.toLowerCase() === selfId?.toLowerCase());
    const isMyActiveAnswer = isMyBuzzed && !isMySubmitted;
    const isSomeoneBuzzed = buzzedUserIds.length > 0;

    // VFX Overlay
    const renderVFX = () => {
        if (!answerResult || lastRoundResult) return null;
        const isCorrect = answerResult.is_correct;
        const isSelf = answerResult.user_id === selfId;

        // Only show large centered VFX for self
        if (!isSelf) return null;

        return (
            <View className="absolute inset-0 z-[2000] flex items-center justify-center pointer-events-none overflow-hidden">
                <View className={cn(
                    "flex flex-col items-center animate-in zoom-in duration-300 scale-125 md:scale-[2.5]",
                    isCorrect ? "text-brand-success/60" : "text-brand-danger/60"
                )}>
                    {isCorrect ? (
                        <View className="relative">
                            <View className="text-8xl md:text-9xl font-bold border-[12px] border-brand-success/40 rounded-full w-24 h-24 md:w-40 md:h-40 flex items-center justify-center">
                            </View>
                        </View>
                    ) : (
                        <X size={120} strokeWidth={6} className="md:size-[200px] opacity-60" />
                    )}
                </View>
            </View>
        );
    };

    useEffect(() => {
        if (!expiresAtMs) {
            setTimeLeftMs(0);
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, expiresAtMs - now);
            setTimeLeftMs(diff);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 50);
        return () => clearInterval(interval);
    }, [expiresAtMs]);

    useEffect(() => {
        if (isMyActiveAnswer) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isMyActiveAnswer]);

    useEffect(() => {
        if (!question) return;
        setAnswer('');
    }, [question?.id]);

    const getAnswerFontSize = (text: string) => {
        const len = text.length;
        if (len <= 8) return "text-4xl md:text-6xl";
        if (len <= 15) return "text-3xl md:text-5xl";
        if (len <= 25) return "text-2xl md:text-3xl";
        return "text-xl md:text-2xl";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (answer.trim()) {
            onSubmit(answer.trim());
        }
    };

    const buzzedUser = players.find(p => p.user_id.toLowerCase() === buzzedUserId?.toLowerCase());

    if (!question) return null;

    return (
        <Stack gap="xl" className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500 relative">
            {renderVFX()}
            {/* Header: Progress & Scores */}
            <Flex justify="between" align="center" className="px-2">
                <Stack gap="xs" className="w-[120px]">
                    <Text variant="xs" color="primary" weight="bold" className="uppercase tracking-widest opacity-60">
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </Text>
                </Stack>

                {/* Timer Section moved center or kept right */}
                {expiresAtMs && !lastRoundResult && (
                    <Flex justify="center" align="center" gap="sm" className="hidden md:flex">
                        <Flex gap="xs" align="center">
                            <Clock size={16} className={cn(timeLeftMs < 5000 ? "text-brand-danger animate-pulse" : "text-secondary")} />
                            <Text variant="detail" weight="bold" color={timeLeftMs < 5000 ? "danger" : "secondary"}>
                                {(timeLeftMs / 1000).toFixed(1)}s
                            </Text>
                        </Flex>
                    </Flex>
                )}

                <Flex gap="xs" className="flex-1 justify-end overflow-x-auto no-scrollbar scroll-smooth">
                    {[...players]
                        .sort((a, b) => {
                            // Buzzed first (priority by order), then by score
                            const bA = buzzedUserIds.indexOf(a.user_id);
                            const bB = buzzedUserIds.indexOf(b.user_id);
                            if (bA !== -1 && bB !== -1) return bA - bB;
                            if (bA !== -1) return -1;
                            if (bB !== -1) return 1;
                            return b.score - a.score;
                        })
                        .map((p, i) => {
                            const buzzIdx = buzzedUserIds.indexOf(p.user_id);
                            const isBuzzed = buzzIdx !== -1;
                            const isUserAnswerResult = answerResult?.user_id === p.user_id;

                            return (
                                <Flex key={p.user_id} align="center" gap="sm" className={cn(
                                    "px-3 py-1.5 rounded-full border transition-all shrink-0",
                                    p.user_id === selfId ? "border-brand-primary bg-brand-primary/10 shadow-sm" : "border-surface-muted bg-surface-base",
                                    isBuzzed ? "ring-2 ring-yellow-400" : ""
                                )}>
                                    <View className="relative">
                                        <View className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center bg-surface-muted text-[10px] font-bold overflow-hidden shrink-0",
                                            i === 0 && !isBuzzed ? "bg-yellow-400 text-slate-900 shadow-sm" : ""
                                        )}>
                                            {p.icon_url ? (
                                                <img src={p.icon_url} alt={p.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <Text variant="xs" weight="bold">{p.username.charAt(0).toUpperCase()}</Text>
                                            )}
                                        </View>
                                        {isBuzzed && (
                                            <View className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center text-[8px] font-black border border-white">
                                                {buzzIdx + 1}
                                            </View>
                                        )}
                                        {/* Localized feedback for others */}
                                        {isUserAnswerResult && (
                                            <View className={cn(
                                                "absolute inset-0 flex items-center justify-center rounded-full animate-in zoom-in duration-300 pointer-events-none bg-surface-base/40 backdrop-blur-[1px]",
                                                answerResult.is_correct ? "text-brand-success" : "text-brand-danger"
                                            )}>
                                                {answerResult.is_correct ? <Check size={18} strokeWidth={4} /> : <X size={18} strokeWidth={4} />}
                                            </View>
                                        )}
                                    </View>
                                    <Stack gap="none">
                                        <Text variant="xs" weight="bold" className="max-w-[80px] truncate leading-tight">{p.username}</Text>
                                        <Text variant="xs" color="secondary" className="font-mono text-[10px] opacity-70 leading-tight">{p.score} pts</Text>
                                    </Stack>
                                </Flex>
                            );
                        })}
                </Flex>
            </Flex>

            <Card padding="lg" className="relative border-t-4 border-t-brand-primary shadow-2xl min-h-[280px] flex flex-col justify-center">
                {/* Buzz Overlay */}
                {buzzedUserId && !lastRoundResult && (
                    <View className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-yellow-400 text-slate-900 font-black rounded-full shadow-xl animate-bounce flex items-center gap-2 border-2 border-white z-20">
                        <Zap size={18} fill="currentColor" />
                        {(buzzedUser?.username || 'SOMEONE').toUpperCase()} BUZZED!
                    </View>
                )}

                <Stack gap="lg" align="center" className="text-center w-full">
                    {!lastRoundResult ? (
                        <Text variant="h3" weight="bold" className="leading-tight text-xl md:text-3xl px-2 animate-in fade-in duration-500">
                            {question.question_text}
                        </Text>
                    ) : (
                        <Stack gap="md" align="center" className="w-full animate-in fade-in zoom-in-95 duration-500 px-4">
                            <Stack gap="xs">
                                <Text variant="xs" color="secondary" weight="bold" className="uppercase tracking-[0.4em] opacity-40">正解は</Text>
                                <Text
                                    variant="h1"
                                    color="primary"
                                    weight="bold"
                                    className={cn("leading-tight drop-shadow-sm text-brand-primary break-all transition-all duration-300", getAnswerFontSize(lastRoundResult.correct_answer))}
                                >
                                    {lastRoundResult.correct_answer}
                                </Text>
                            </Stack>

                            <View className="h-px w-16 bg-brand-primary/20 mx-auto" />

                            <Stack gap="sm" className="w-full">
                                <Text variant="detail" weight="bold" className="leading-snug opacity-90 line-clamp-2 text-base text-secondary">
                                    {question.question_text}
                                </Text>
                                {question.description_text && (
                                    <Text variant="xs" color="secondary" className="italic opacity-60 leading-relaxed line-clamp-2">
                                        {question.description_text}
                                    </Text>
                                )}
                            </Stack>

                            <Flex align="center" gap="sm" className="mt-2 animate-pulse bg-brand-primary/5 px-4 py-1.5 rounded-full border border-brand-primary/5">
                                <Clock size={14} className="text-brand-primary" />
                                <Text variant="xs" weight="bold" color="primary" className="tracking-widest uppercase text-[10px]">Preparing Next Round</Text>
                            </Flex>
                        </Stack>
                    )}
                </Stack>
            </Card>

            {/* Action Area */}
            <View className="h-32 flex items-center justify-center pt-8">
                {lastRoundResult ? null : (
                    (() => {
                        const isLimitReached = buzzedUserIds.length >= maxBuzzes;
                        const canBuzz = !isMyBuzzed && !isLimitReached;

                        if (isMyActiveAnswer) {
                            return (
                                <form onSubmit={handleSubmit} className="w-full max-w-md animate-in slide-in-from-bottom-4">
                                    <Stack gap="md">
                                        <Text align="center" variant="xs" weight="bold" color="primary" className="animate-pulse">
                                            あなたの回答を入力してください！
                                        </Text>
                                        <Flex gap="sm">
                                            <Input
                                                ref={inputRef}
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                                placeholder="答えを入力..."
                                                className="text-lg py-6 shadow-lg border-2 border-brand-primary"
                                                autoFocus
                                            />
                                            <Button type="submit" variant="solid" color="primary" className="px-8 shadow-lg">
                                                送信
                                            </Button>
                                        </Flex>
                                    </Stack>
                                </form>
                            );
                        }

                        return (
                            <Stack gap="md" align="center" className="w-full relative">
                                <Button
                                    variant="solid"
                                    color={canBuzz ? "primary" : "secondary"}
                                    disabled={!canBuzz}
                                    className={cn(
                                        "w-48 h-48 rounded-full shadow-2xl font-black text-2xl flex flex-col items-center justify-center gap-2 transition-all border-8 border-white",
                                        canBuzz ? "shadow-brand-primary/40 hover:scale-105 active:scale-95 cursor-pointer" : "opacity-50 grayscale cursor-not-allowed"
                                    )}
                                    onClick={onBuzz}
                                >
                                    <Zap size={48} fill="white" />
                                    {isLimitReached ? "満員" : "BUZZ!"}
                                </Button>

                                {buzzedUserIds.length > 0 && (
                                    <View className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max">
                                        <Flex gap="sm" align="center" className="text-yellow-500 animate-pulse bg-yellow-400/10 px-4 py-1.5 rounded-full border border-yellow-400/20">
                                            <Clock size={14} />
                                            <Text variant="xs" weight="bold">
                                                現在{buzzedUserIds.length - submittedUserIds.length}人が解答中...
                                            </Text>
                                        </Flex>
                                    </View>
                                )}
                            </Stack>
                        );
                    })()
                )}
            </View>

        </Stack>
    );
}
