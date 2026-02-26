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
    lastRoundResult: { correct_answer: string; scores: PlayerScore[] } | null;
    players: PlayerScore[];
    selfId: string | null;
    onBuzz: () => void;
    onSubmit: (answer: string) => void;
    expiresAtMs: number | null;
    answerResult: { user_id: string, is_correct: boolean } | null;
    currentQuestionIndex: number;
    totalQuestions: number;
}

export function BattleQuiz({
    question,
    buzzedUserId,
    lastRoundResult,
    players,
    selfId,
    onBuzz,
    onSubmit,
    expiresAtMs,
    answerResult,
    currentQuestionIndex,
    totalQuestions
}: BattleQuizProps) {
    const [answer, setAnswer] = useState('');
    const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const isMyBuzz = buzzedUserId === selfId;
    const isSomeoneBuzzed = buzzedUserId !== null;

    // VFX Overlay
    const renderVFX = () => {
        if (!answerResult) return null;
        const isCorrect = answerResult.is_correct;
        const username = players.find(p => p.user_id === answerResult.user_id)?.username || 'Someone';

        return (
            <View className="absolute inset-0 z-[2000] flex items-start justify-center pointer-events-none overflow-hidden pt-12 md:pt-16">
                <View className={cn(
                    "flex flex-col items-center animate-in zoom-in duration-300 scale-75 md:scale-90",
                    isCorrect ? "text-brand-success/60" : "text-brand-danger/60"
                )}>
                    {isCorrect ? (
                        <View className="relative">
                            <View className="text-6xl md:text-7xl font-bold border-8 border-brand-success/40 rounded-full w-16 h-16 md:w-24 md:h-24 flex items-center justify-center" style={{ borderWidth: 8 }}>
                                <View className="w-10 h-10 md:w-14 md:h-14" />
                            </View>
                        </View>
                    ) : (
                        <X size={80} strokeWidth={4} className="md:size-[120px] opacity-60" />
                    )}
                    <View className="bg-surface/40 backdrop-blur-sm px-3 py-1.5 rounded-lg mt-2 border border-surface-muted/50 shadow-md">
                        <Text variant="xs" weight="bold" color={isCorrect ? "success" : "danger"}>
                            {username} {isCorrect ? 'Correct!' : 'Incorrect!'}
                        </Text>
                    </View>
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
        if (isMyBuzz) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isMyBuzz]);

    useEffect(() => {
        setAnswer('');
    }, [question.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (answer.trim()) {
            onSubmit(answer.trim());
        }
    };

    const buzzedUser = players.find(p => p.user_id === buzzedUserId);

    return (
        <Stack gap="xl" className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500 relative">
            {renderVFX()}
            {/* Header: Progress & Scores */}
            <Flex justify="between" align="end" className="px-2">
                <Stack gap="xs">
                    <Text variant="xs" color="primary" weight="bold" className="uppercase tracking-widest opacity-60">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </Text>
                    <Flex gap="sm" align="center">
                        <View className="h-2 w-48 bg-surface-muted rounded-full overflow-hidden">
                            <View
                                className="h-full bg-brand-primary transition-all duration-1000"
                                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                            />
                        </View>
                    </Flex>
                </Stack>

                {/* Timer Section */}
                {expiresAtMs && !lastRoundResult && (
                    <Stack gap="xs" align="end" className="flex-1 max-w-[200px]">
                        <Flex gap="xs" align="center">
                            <Clock size={14} className={cn(timeLeftMs < 5000 ? "text-brand-danger animate-pulse" : "text-secondary")} />
                            <Text variant="xs" weight="bold" color={timeLeftMs < 5000 ? "danger" : "secondary"}>
                                {(timeLeftMs / 1000).toFixed(1)}s
                            </Text>
                        </Flex>
                        <View className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                            <View
                                className={cn(
                                    "h-full transition-all duration-100",
                                    timeLeftMs < 5000 ? "bg-brand-danger" : "bg-yellow-500"
                                )}
                                style={{ width: `${(timeLeftMs / (isSomeoneBuzzed ? 10000 : 20000)) * 100}%` }}
                            />
                        </View>
                    </Stack>
                )}

                <Flex gap="md" className="hidden md:flex">
                    {players.slice(0, 3).map((p, i) => (
                        <Flex key={p.user_id} align="center" gap="xs" className={cn(
                            "px-3 py-1 rounded-full border transition-all",
                            p.user_id === selfId ? "border-brand-primary bg-brand-primary/10" : "border-surface-muted bg-surface-base"
                        )}>
                            <Text variant="xs" weight="bold" color={i === 0 ? "primary" : "secondary"}>
                                #{i + 1} {p.username}
                            </Text>
                            <Text variant="xs" weight="bold">{p.score}</Text>
                        </Flex>
                    ))}
                </Flex>
            </Flex>

            {/* Main Question Card */}
            <Card padding="xl" className="relative border-t-4 border-t-brand-primary shadow-2xl min-h-[300px] flex flex-col justify-center overflow-visible">
                {/* Buzz Overlay */}
                {isSomeoneBuzzed && !lastRoundResult && (
                    <View className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-yellow-400 text-slate-900 font-black rounded-full shadow-xl animate-bounce flex items-center gap-2 border-2 border-white">
                        <Zap size={18} fill="currentColor" />
                        {buzzedUser?.username.toUpperCase()} BUZZED!
                    </View>
                )}

                <Stack gap="xl" align="center" className="text-center">
                    <Text variant="h2" weight="bold" className="leading-tight text-3xl md:text-5xl">
                        {question.question_text}
                    </Text>
                    {question.description_text && (
                        <Text color="secondary" className="opacity-70 italic">
                            {question.description_text}
                        </Text>
                    )}
                </Stack>

                {/* Answer Result Feedback */}
                {lastRoundResult && (
                    <View className="absolute inset-0 bg-surface-base/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300 rounded-brand-xl">
                        <Stack gap="lg" align="center" className="text-center">
                            <View className="p-4 rounded-full bg-brand-primary/10 text-brand-primary">
                                <MessageSquare size={48} />
                            </View>
                            <Stack gap="none">
                                <Text variant="xs" color="secondary" weight="bold">正解は...</Text>
                                <Text variant="h1" color="primary" weight="bold" className="text-4xl">{lastRoundResult.correct_answer}</Text>
                            </Stack>
                            <Text variant="xs" className="animate-pulse opacity-60">次の問題へ進みます...</Text>
                        </Stack>
                    </View>
                )}
            </Card>

            {/* Action Area */}
            <View className="h-32 flex items-center justify-center">
                {!isSomeoneBuzzed && !lastRoundResult ? (
                    <Button
                        variant="solid"
                        color="primary"
                        className="w-48 h-48 rounded-full shadow-2xl shadow-brand-primary/40 text-2xl font-black border-8 border-white hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group p-0"
                        onClick={onBuzz}
                    >
                        <Zap size={48} fill="white" className="group-hover:animate-pulse" />
                        BUZZ!
                    </Button>
                ) : isMyBuzz && !lastRoundResult ? (
                    <form onSubmit={handleSubmit} className="w-full max-w-md animate-in slide-in-from-bottom-4">
                        <Stack gap="md">
                            <Text align="center" variant="xs" weight="bold" color="primary" className="animate-pulse">
                                解答を入力してください！
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
                ) : isSomeoneBuzzed && !lastRoundResult ? (
                    <Stack gap="sm" align="center" className="animate-pulse">
                        <Flex gap="sm" align="center" className="text-yellow-500">
                            <Clock size={24} />
                            <Text weight="bold">{buzzedUser?.username}が回答中...</Text>
                        </Flex>
                        <Text variant="xs" color="secondary">他のプレイヤーが回答権を得るまでお待ちください</Text>
                    </Stack>
                ) : null}
            </View>

            {/* Players Sidebar (Mobile hidden, shown as bottom bar) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {players.map((p) => (
                    <Card key={p.user_id} padding="sm" className={cn(
                        "transition-all border-l-4",
                        p.user_id === selfId ? "border-l-brand-primary bg-brand-primary/5" : "border-l-transparent",
                        buzzedUserId === p.user_id ? "ring-2 ring-yellow-400 scale-105" : "opacity-80"
                    )}>
                        <Flex justify="between" align="center">
                            <Stack gap="none" className="overflow-hidden">
                                <Text variant="xs" weight="bold" className="truncate">{p.username}</Text>
                                <Text variant="xs" color="secondary">{p.score} pts</Text>
                            </Stack>
                            {buzzedUserId === p.user_id && (
                                <Zap size={16} className="text-yellow-500 fill-yellow-500" />
                            )}
                        </Flex>
                    </Card>
                ))}
            </div>
        </Stack>
    );
}
