"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { MatchQuestion, PlayerScore, MatchConfig } from '@/src/entities/battle';
import { Trophy, Clock, Zap, Check, X, AlertCircle, XCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { View } from '@/src/design/primitives/View';
import { FourChoiceInput } from '@/src/features/quiz/components/inputs/FourChoiceInput';
import { CharacterPoolInput } from '@/src/features/quiz/components/inputs/CharacterPoolInput';
import { EditRequestModal } from '@/src/features/questions/components/EditRequestModal';
import { Icon } from '@/src/design/baseComponents/Icon';

interface BattleQuizProps {
    question: MatchQuestion;
    buzzedUserId: string | null;
    buzzerQueue: string[];
    submittedUserIds: string[];
    lastRoundResult: { correct_answer: string; scores: PlayerScore[] } | null;
    players: PlayerScore[];
    selfId: string | null;
    onBuzz: () => void;
    onSubmit: (answer: string) => void;
    onPartialSubmit: (answer: string) => void;
    partialAnswers: Record<string, string>;
    activeBuzzers: Record<string, number>;
    expiresAtMs: number | null;
    answerResult: { user_id: string, is_correct: boolean } | null;
    currentQuestionIndex: number;
    totalQuestions: number;
    maxBuzzes: number;
    preferredMode?: string;
    dummyCharCount?: number;
    config: MatchConfig;
    onBackToLobby: () => void;
    onUpdateLocalQuestion?: (id: string, updates: any) => void;
    isHost?: boolean;
}

export function BattleQuiz({
    question,
    buzzedUserId,
    buzzerQueue = [],
    submittedUserIds = [],
    lastRoundResult,
    players,
    selfId,
    onBuzz,
    onSubmit,
    onPartialSubmit,
    partialAnswers = {},
    activeBuzzers = {},
    expiresAtMs,
    answerResult,
    currentQuestionIndex,
    totalQuestions,
    maxBuzzes,
    preferredMode = 'text',
    dummyCharCount = 6,
    config,
    onBackToLobby,
    onUpdateLocalQuestion,
    isHost
}: BattleQuizProps) {
    const [answer, setAnswer] = useState('');
    const [activeMode, setActiveMode] = useState<string>(preferredMode);
    const [showFallback, setShowFallback] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
    const [timerTotalMs, setTimerTotalMs] = useState<number>(0); // captures initial timer duration for progress bar
    const timeLeftMsRef = useRef<number>(0);       // live reading for buzz-time capture
    const lastEffectiveExpiryRef = useRef<number | null>(null);
    const buzzTimesRef = useRef<Map<string, number>>(new Map()); // userId → timeLeftMs when they buzzed
    const inputRef = useRef<HTMLInputElement>(null);

    const isMyBuzzed = React.useMemo(() =>
        buzzerQueue.some(id => id.toLowerCase() === selfId?.toLowerCase()),
        [buzzerQueue, selfId]
    );

    const myExpiry = React.useMemo(() => {
        if (!selfId) return null;
        const entry = Object.entries(activeBuzzers).find(
            ([uid]) => uid.toLowerCase() === selfId.toLowerCase()
        );
        return entry ? entry[1] : null;
    }, [activeBuzzers, selfId]);

    const isMyActiveAnswer = !!myExpiry;

    const isSubmitted = React.useMemo(() =>
        submittedUserIds.some(id => id.toLowerCase() === selfId?.toLowerCase()),
        [submittedUserIds, selfId]
    );

    const isAnswering = !!myExpiry && !isSubmitted;
    const canStillBuzz = !isMyBuzzed && buzzerQueue.length < maxBuzzes && timeLeftMs > 0 && !isSubmitted;
    const hasRights = isAnswering || canStillBuzz;

    // Mode fallback logic — runs on every new question AND whenever preferredMode changes
    useEffect(() => {
        if (!question) return;

        // Always start from the requested mode (prevents stale activeMode from previous question)
        let targetMode = preferredMode;

        // 1. Omakase (Auto) Logic
        if (targetMode === 'omakase') {
            const rec = question.recommended_mode;
            if (rec === 'fourChoice' || rec === 'choice') {
                targetMode = 'fourChoice';
            } else if (rec === 'text' || rec === 'recall') {
                targetMode = 'text';
            } else if (rec === 'chips') {
                targetMode = 'chips';
            } else {
                targetMode = 'chips';
            }
        }

        // 2. Compatibility Checks & Fallbacks

        // 4-choice fallback
        if (targetMode === 'fourChoice' && (!question.distractors || question.distractors.length === 0)) {
            targetMode = 'text';
        }

        // Chips fallback: requires either non-empty rubis OR non-empty correct_answers
        if (targetMode === 'chips') {
            const hasRubis = question.answer_rubis && question.answer_rubis.some(r => r.trim().length > 0);
            const hasAnswers = question.correct_answers && question.correct_answers.some(a => a.trim().length > 0);

            if (!hasRubis && !hasAnswers) {
                targetMode = 'text';
            }
        }

        // Always update activeMode so stale state from previous question never persists
        setActiveMode(targetMode);
        const didFallback = targetMode !== preferredMode && preferredMode !== 'omakase';
        setShowFallback(didFallback);
        if (didFallback) {
            const timer = setTimeout(() => setShowFallback(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [question, preferredMode]);

    useEffect(() => {
        const effectiveExpiry = myExpiry || expiresAtMs;

        if (!effectiveExpiry) {
            setTimeLeftMs(0);
            timeLeftMsRef.current = 0;
            lastEffectiveExpiryRef.current = null;
            return;
        }

        // Only update timerTotalMs if the expiry actually changed
        if (effectiveExpiry !== lastEffectiveExpiryRef.current) {
            const now = Date.now();
            const remaining = Math.max(0, effectiveExpiry - now);
            setTimerTotalMs(remaining);
            lastEffectiveExpiryRef.current = effectiveExpiry;
        }

        // Reset buzz timestamps for fresh question (only if not already buzzing)
        if (!myExpiry && buzzerQueue.length === 0) {
            buzzTimesRef.current.clear();
        }

        const updateTimer = () => {
            const n = Date.now();
            const diff = Math.max(0, effectiveExpiry - n);
            timeLeftMsRef.current = diff;
            setTimeLeftMs(diff);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 50);
        return () => clearInterval(interval);
    }, [expiresAtMs, myExpiry, buzzerQueue.length]);

    // Record the time remaining when each player first enters the buzzer queue
    useEffect(() => {
        buzzerQueue.forEach((uid) => {
            if (!buzzTimesRef.current.has(uid)) {
                buzzTimesRef.current.set(uid, timeLeftMsRef.current);
            }
        });
    }, [buzzerQueue]);

    // Auto-clear answer when result shows up for ME
    useEffect(() => {
        if (answerResult && answerResult.user_id === selfId) {
            setAnswer('');
        }
    }, [answerResult, selfId]);


    const getAnswerFontSize = (text: string) => {
        const len = text.length;
        if (len <= 5) return "text-4xl md:text-6xl";
        if (len <= 8) return "text-3xl md:text-5xl";
        if (len <= 12) return "text-2xl md:text-4xl";
        if (len <= 20) return "text-xl md:text-3xl";
        if (len <= 30) return "text-lg md:text-2xl";
        return "text-base md:text-xl";
    };

    const ordinal = (n: number): string => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const buzzedUser = players.find(p => p.user_id.toLowerCase() === buzzedUserId?.toLowerCase());

    const renderVFX = () => {
        if (!answerResult) return null;
        const isCorrect = answerResult.is_correct;
        const isSelf = answerResult.user_id === selfId;
        if (!isSelf) return null;

        // Keep VFX visible even when lastRoundResult arrives
        return (
            <View className="absolute inset-0 z-[2000] flex items-center justify-center pointer-events-none overflow-hidden">
                <View className={cn(
                    "flex flex-col items-center animate-in zoom-in duration-300 scale-125 md:scale-[2.5]",
                    isCorrect ? "text-brand-success/60" : "text-brand-danger/60"
                )}>
                    {isCorrect ? (
                        <View className="text-8xl md:text-9xl font-bold border-[12px] border-brand-success/40 rounded-full w-24 h-24 md:w-40 md:h-40 flex items-center justify-center" />
                    ) : (
                        <X size={120} strokeWidth={6} className="md:size-[200px] opacity-40" />
                    )}
                </View>
            </View>
        );
    };

    if (!question) return null;

    return (
        <Stack gap="md" className="w-full max-w-4xl mx-auto px-6 sm:px-10 animate-in fade-in zoom-in-95 duration-500 relative h-full overflow-y-auto flex-1 pb-12">
            {renderVFX()}

            {/* Header: players + info bar */}
            <Stack gap="xs" className="shrink-0">
                {/* Row 1: player mini-cards left-aligned */}
                <Flex gap="sm" className="justify-start overflow-x-auto no-scrollbar px-4 pt-2">
                    {[...players]
                        .sort((a, b) => {
                            const bA = buzzerQueue.indexOf(a.user_id);
                            const bB = buzzerQueue.indexOf(b.user_id);
                            if (bA !== -1 && bB !== -1) return bA - bB;
                            if (bA !== -1) return -1;
                            if (bB !== -1) return 1;
                            return b.score - a.score;
                        })
                        .map((p) => {
                            const buzzIdx = buzzerQueue.findIndex(id => id.toLowerCase() === p.user_id.toLowerCase());
                            const isBuzzed = buzzIdx !== -1;
                            const isActive = Object.keys(activeBuzzers).some(uid => uid.toLowerCase() === p.user_id.toLowerCase());
                            const isUserResult = answerResult?.user_id.toLowerCase() === p.user_id.toLowerCase();
                            const buzzTime = buzzTimesRef.current.get(p.user_id);

                            return (
                                <View key={p.user_id} className="flex flex-col items-center gap-0 shrink-0">
                                    {/* Buzz time — above avatar */}
                                    <View className="h-[12px] flex items-end justify-center">
                                        <Text className="text-[8px] font-mono text-brand-primary/80 leading-tight h-2.5 text-center">
                                            {buzzTime !== undefined ? `${(buzzTime / 1000).toFixed(1)}s` : ''}
                                        </Text>
                                    </View>

                                    {/* Avatar + rank badge */}
                                    <View className="relative mt-0.5">
                                        <View className={cn(
                                            "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-surface-muted overflow-hidden font-bold text-xs sm:text-sm",
                                            p.user_id === selfId ? "ring-2 ring-brand-primary ring-offset-1" : "",
                                            isActive ? "ring-2 ring-yellow-400 ring-offset-1" : ""
                                        )}>
                                            {p.icon_url
                                                ? <View as="img" src={p.icon_url} alt={p.username} className="w-full h-full object-cover" />
                                                : <Text as="span" className="font-bold">{p.username.charAt(0).toUpperCase()}</Text>}
                                        </View>
                                        {/* Result badge - overlaying the entire avatar */}
                                        {isUserResult && (
                                            <View className="absolute -inset-1 flex items-center justify-center animate-in zoom-in duration-300 z-20 pointer-events-none">
                                                {answerResult!.is_correct
                                                    ? <View className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-[3px] sm:border-[5px] border-brand-success drop-shadow-sm" />
                                                    : <X size={28} strokeWidth={5} className="text-brand-danger drop-shadow-md sm:size-[34px]" />}
                                            </View>
                                        )}
                                        {/* Buzz order badge – top-left */}
                                        {isBuzzed && (
                                            <View className={cn(
                                                "absolute -bottom-1 -left-1 px-1 min-w-[16px] h-3.5 sm:min-w-[18px] sm:h-4 rounded-full flex items-center justify-center text-[7px] sm:text-[8px] font-black border border-white leading-none z-10",
                                                isActive ? "bg-yellow-400 text-slate-900" : "bg-slate-500 text-white"
                                            )}>
                                                {ordinal(buzzIdx + 1)}
                                            </View>
                                        )}
                                    </View>

                                    {/* Name */}
                                    <Text className="text-[8px] sm:text-[9px] font-bold max-w-[40px] sm:max-w-[48px] px-0.5 sm:px-1 break-words text-center leading-tight mt-0.5" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {p.username}
                                    </Text>

                                    {/* Score */}
                                    <Text className="text-[9px] sm:text-[10px] font-black font-mono text-brand-primary leading-tight">
                                        {p.score}
                                    </Text>
                                </View>
                            );
                        })}
                </Flex>

                {/* Row 2: [left spacer] [Q# center] [timer right] */}
                <Flex align="center" className="w-full">
                    <View className="flex-1" />
                    <Text variant="xs" color="primary" weight="bold" className="flex-1 text-center uppercase tracking-widest opacity-60 text-[8px] sm:text-[10px]">
                        {currentQuestionIndex + 1} / {totalQuestions}
                    </Text>
                    <View className="flex-1 flex justify-end">
                        {timeLeftMs > 0 && !lastRoundResult && hasRights && (
                            <Flex gap="xs" align="center" className="animate-in fade-in duration-300">
                                {selfId && activeBuzzers[selfId] && <Zap size={10} className="text-yellow-400 animate-pulse" />}
                                <Clock size={10} className={cn(timeLeftMs < 5000 ? "text-brand-danger animate-pulse" : "text-secondary")} />
                                <Text className={cn("text-[9px] sm:text-[10px] font-mono font-bold", timeLeftMs < 5000 ? "text-brand-danger" : "text-secondary")}>
                                    {(timeLeftMs / 1000).toFixed(1)}s
                                </Text>
                            </Flex>
                        )}
                    </View>
                </Flex>
            </Stack>

            {/* Timer Progress Bar */}
            <View className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden -mt-2">
                <View
                    className={cn(
                        "h-full rounded-full transition-none",
                        !expiresAtMs || lastRoundResult ? "w-0"
                            : timeLeftMs < 5000 ? "bg-brand-danger"
                                : "bg-brand-primary"
                    )}
                    style={{
                        width: !lastRoundResult && hasRights && timerTotalMs > 0
                            ? `${(timeLeftMs / timerTotalMs) * 100}%`
                            : '0%',
                        transition: 'width 50ms linear, background-color 0.3s'
                    }}
                />
            </View>

            <Card padding="xs" className={cn(
                "relative shadow-xl flex flex-col flex-1 min-h-0 overflow-y-auto",
                "border-2 transition-colors duration-500",
                answerResult && answerResult.user_id === selfId
                    ? answerResult.is_correct
                        ? "border-brand-success shadow-brand-success/30 shadow-lg"
                        : "border-brand-danger shadow-brand-danger/30 shadow-lg"
                    : "border-transparent"
            )}>


                {/* Fallback Notification */}
                {showFallback && !lastRoundResult && (
                    <View className="absolute top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand-primary text-white text-[10px] font-bold rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 z-30">
                        <AlertCircle size={12} />
                        モード未対応のためテキスト入力に切り替えました
                    </View>
                )}

                <Stack gap="md" align="center" className="text-center w-full my-auto py-2">
                    {!lastRoundResult ? (
                        <Text variant="h3" weight="bold" className="leading-tight text-base md:text-2xl px-1">
                            {question.question_text}
                        </Text>
                    ) : (
                        <Stack gap="md" align="center" className="w-full animate-in fade-in zoom-in-95 duration-500 px-4">
                            <Stack gap="xs">
                                <Text
                                    variant="xs"
                                    color="primary"
                                    weight="bold"
                                    className="uppercase tracking-[0.4em] opacity-80"
                                >
                                    正解は
                                </Text>
                                <Text
                                    variant="h1"
                                    weight="bold"
                                    className={cn(
                                        "leading-tight drop-shadow-sm break-words overflow-hidden transition-all duration-300",
                                        lastRoundResult ? getAnswerFontSize(lastRoundResult.correct_answer) : ""
                                    )}
                                >
                                    <View as="span" className="text-brand-primary">
                                        {lastRoundResult?.correct_answer}
                                    </View>
                                </Text>
                            </Stack>

                            <View className="h-px w-16 bg-brand-primary/20 mx-auto" />
                            <Stack gap="sm" className="w-full">
                                <Text variant="detail" weight="bold" className="leading-snug opacity-95 text-sm md:text-base break-words">
                                    {question.question_text}
                                </Text>
                                {question.description_text && (
                                    <View className="relative w-full">
                                        <Text variant="xs" color="secondary" className="italic opacity-80 leading-relaxed break-words pr-8">
                                            {question.description_text}
                                        </Text>
                                    </View>
                                )}
                                {!question.description_text && (
                                    <View className="h-4" />
                                )}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
                {lastRoundResult && (
                    <View className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <Flex align="center" gap="xs" className="animate-pulse bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20 backdrop-blur-sm shadow-sm">
                            <Clock size={10} className="text-brand-primary" />
                            <Text variant="xs" weight="bold" color="primary" className="tracking-[0.2em] uppercase text-[8px] sm:text-[9px]">Preparing Next Round</Text>
                        </Flex>
                    </View>
                )}
            </Card>

            {isEditing && (
                <EditRequestModal
                    question={{
                        id: question.id,
                        collectionId: '',
                        questionText: question.question_text,
                        correctAnswers: question.correct_answers,
                        answerRubis: question.answer_rubis,
                        distractors: question.distractors,
                        descriptionText: question.description_text,
                        preferredMode: 'chips',
                        recommendedMode: 'chips'
                    }}
                    onClose={() => setIsEditing(false)}
                    onDirectUpdate={(updates) => {
                        onUpdateLocalQuestion?.(question.id, {
                            question_text: updates.questionText,
                            correct_answers: updates.correctAnswers,
                            answer_rubis: updates.answerRubis,
                            distractors: updates.distractors,
                            description_text: updates.descriptionText
                        });
                    }}
                    isOwner={isHost}
                />
            )}

            {/* Action Area */}
            {!lastRoundResult && (
                <View className="h-40 sm:h-48 flex items-center justify-center pt-4 sm:pt-8 shrink-0">
                    {(() => {
                        const isLimitReached = buzzerQueue.length >= maxBuzzes;
                        const isTimeUp = timeLeftMs <= 0;

                        // Robust derived states
                        const isAnswering = isMyActiveAnswer && !isSubmitted;
                        const hasExhaustedRights = isMyBuzzed || (isLimitReached && !isAnswering) || (isTimeUp && !isAnswering) || isSubmitted;

                        // CASE 1: I am currently answering
                        if (isAnswering) {
                            const onPartialInput = (newVal: string) => {
                                const normalized = newVal.replace(/\s/g, "");
                                setAnswer(normalized);
                                onPartialSubmit(normalized);
                            };

                            if (activeMode === 'fourChoice') {
                                return (
                                    <View className="w-full max-w-lg animate-in slide-in-from-bottom-4">
                                        <FourChoiceInput
                                            correctAnswers={question.correct_answers}
                                            distractors={question.distractors}
                                            onInput={(val) => onSubmit(val)}
                                        />
                                    </View>
                                );
                            } else if (activeMode === 'chips') {
                                const hasValidRubis = question.answer_rubis && question.answer_rubis.some(r => r.trim().length > 0);
                                const chipsSource = hasValidRubis ? question.answer_rubis! : (question.correct_answers || []);
                                const hasChipsSource = chipsSource.some(s => s.trim().length > 0);

                                if (!hasChipsSource) {
                                    return (
                                        <View className="w-full max-w-md animate-in slide-in-from-bottom-4">
                                            <View as="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); if (answer.trim()) onSubmit(answer.trim()); }} className="w-full">
                                                <Stack gap="md">
                                                    <Text align="center" variant="xs" weight="bold" color="primary" className="animate-pulse">回答を入力してください！</Text>
                                                    <Input
                                                        ref={inputRef}
                                                        value={answer}
                                                        onChange={e => setAnswer(e.target.value)}
                                                        placeholder="答えを入力..."
                                                        className="text-center text-lg py-6 font-bold shadow-inner"
                                                        autoFocus
                                                    />
                                                    <Button type="submit" variant="solid" color="primary" disabled={!answer.trim()} className="w-full py-4">
                                                        回答する
                                                    </Button>
                                                </Stack>
                                            </View>
                                        </View>
                                    );
                                }

                                return (
                                    <View className="w-full max-w-md animate-in slide-in-from-bottom-4">
                                        <Stack gap="md">
                                            <View className="relative">
                                                <Input
                                                    readOnly
                                                    value={answer}
                                                    placeholder="回答中..."
                                                    className="text-2xl py-4 shadow-inner bg-surface-base border-2 border-brand-primary text-center font-bold tracking-widest pointer-events-none"
                                                />
                                            </View>
                                            <CharacterPoolInput
                                                rubis={question.answer_rubis || []}
                                                answers={question.correct_answers || []}
                                                currentInput={answer || ""}
                                                onInput={(char) => {
                                                    const newAnswer = answer + char;
                                                    const hasKanji = (text: string) => /[\u4E00-\u9FAF]/.test(text);
                                                    let tgt = "";
                                                    const ansList = question.correct_answers || [];
                                                    const rbiList = question.answer_rubis || [];
                                                    for (let i = 0; i < ansList.length; i++) {
                                                        const r = rbiList[i]?.trim();
                                                        const a = ansList[i]?.trim();
                                                        if (r && r.length > 0) {
                                                            tgt = r.replace(/\s/g, "");
                                                            break;
                                                        }
                                                        if (a && a.length > 0 && !hasKanji(a)) {
                                                            tgt = a.replace(/\s/g, "");
                                                            break;
                                                        }
                                                    }
                                                    onPartialInput(newAnswer);
                                                    if (tgt && newAnswer.replace(/\s/g, "").length >= tgt.length) {
                                                        setTimeout(() => onSubmit(newAnswer.trim()), 50);
                                                    }
                                                }}
                                                decoyCount={dummyCharCount}
                                                distractors={question.distractors || []}
                                            />
                                        </Stack>
                                    </View>
                                );
                            } else {
                                return (
                                    <View className="w-full max-w-md animate-in slide-in-from-bottom-4">
                                        <View as="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); if (answer.trim()) onSubmit(answer.trim()); }} className="w-full">
                                            <Stack gap="md">
                                                <Text align="center" variant="xs" weight="bold" color="primary" className="animate-pulse">回答を入力してください！</Text>
                                                <Input
                                                    ref={inputRef}
                                                    value={answer}
                                                    onChange={(e) => {
                                                        setAnswer(e.target.value);
                                                        onPartialSubmit(e.target.value);
                                                    }}
                                                    placeholder="答えを入力..."
                                                    className="text-lg py-6 shadow-lg border-2 border-brand-primary"
                                                    autoFocus
                                                />
                                                <Flex justify="center" gap="md">
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => { setAnswer(''); onPartialSubmit(''); }}>リセット</Button>
                                                    <Button type="submit" variant="solid" color="primary" disabled={!answer.trim()}>回答する</Button>
                                                </Flex>
                                            </Stack>
                                        </View>
                                    </View>
                                );
                            }
                        }

                        // CASE 2: I have NO answering rights (Show others' answers)
                        if (hasExhaustedRights) {
                            return (
                                <View className="w-full max-w-xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                                    <Flex wrap="wrap" justify="center" gap="md" className="px-4">
                                        {buzzerQueue
                                            .filter(uid => uid.toLowerCase() !== selfId?.toLowerCase())
                                            .map((uid) => {
                                                const player = players.find(p => p.user_id.toLowerCase() === uid.toLowerCase());
                                                const hasSubmitted = submittedUserIds.some(id => id.toLowerCase() === uid.toLowerCase());
                                                const text = partialAnswers[uid] || "";

                                                return (
                                                    <Stack key={uid} gap="xs" align="center" className="min-w-[120px] transition-all bg-surface-muted/30 p-3 rounded-2xl border border-brand-primary/10">
                                                        <Flex align="center" gap="xs">
                                                            <View className="w-4 h-4 rounded-full overflow-hidden bg-brand-primary/10">
                                                                {player?.icon_url ? <img src={player.icon_url} className="w-full h-full object-cover" /> : <Text className="text-[6px] text-center">{player?.username[0]}</Text>}
                                                            </View>
                                                            <Text weight="bold" className="text-[10px] opacity-70 truncate max-w-[80px]">{player?.username}</Text>
                                                        </Flex>
                                                        <View className="h-12 flex items-center justify-center">
                                                            {text ? (
                                                                <Text variant="h3" weight="bold" color="primary" className="tracking-tighter">
                                                                    {text}
                                                                </Text>
                                                            ) : (
                                                                <Text className="opacity-20 italic text-xs animate-pulse">入力中...</Text>
                                                            )}
                                                        </View>
                                                    </Stack>
                                                );
                                            })}
                                    </Flex>
                                </View>
                            );
                        }

                        // CASE 3: Active answering possible (Show BUZZ button)
                        return (
                            <Stack gap="md" align="center" className="w-full relative">
                                <Button
                                    variant="solid"
                                    color="primary"
                                    className={cn(
                                        "w-32 h-32 sm:w-48 sm:h-48 rounded-full shadow-2xl font-black text-xl sm:text-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all border-4 sm:border-8 border-white",
                                        "shadow-brand-primary/40 hover:scale-105 active:scale-95 cursor-pointer"
                                    )}
                                    onClick={onBuzz}
                                >
                                    <Zap size={32} className="sm:size-[48px]" fill="white" />
                                    BUZZ!
                                </Button>
                            </Stack>
                        );
                    })()}
                </View>
            )}
        </Stack>
    );
}
