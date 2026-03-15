"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { View } from '@/src/design/primitives/View';
import { Send, AlertCircle, Zap } from 'lucide-react';
import { Question } from '@/src/entities/question';
import { FourChoiceInput } from './inputs/FourChoiceInput';
import { CharacterPoolInput } from './inputs/CharacterPoolInput';
import { useEffect } from 'react';
import AppConfig from '@/src/app_config';

interface QuizFormProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    onSubmitAnswer: (answer: string) => void;
    preferredMode?: string;
    dummyCharCount?: number;
}

export function QuizForm({ question, questionNumber, totalQuestions, onSubmitAnswer, preferredMode = 'fourChoice', dummyCharCount = AppConfig.quiz.default_dummy_char_count }: QuizFormProps) {
    const [answer, setAnswer] = useState('');
    const [activeMode, setActiveMode] = useState<string>(preferredMode);
    const [showFallback, setShowFallback] = useState(false);

    // Mode fallback logic
    useEffect(() => {
        // 1. Initial mode choice
        let targetMode = question.isSelectionOnly ? 'fourChoice' : preferredMode;

        // 2. Compatibility Checks & Fallbacks

        // 4-choice fallback: needs distractors
        if (targetMode === 'fourChoice' && (!question.distractors || question.distractors.length === 0)) {
            // If it was forced by isSelectionOnly but has no distractors, this is a data error, 
            // but we fallback to text to keep it playable.
            targetMode = 'text';
        }

        // Chips fallback: needs chipAnswer
        if (targetMode === 'chips' && !question.chipAnswer) {
            targetMode = 'text';
        }

        if (targetMode !== activeMode) {
            // Show fallback warning if the mode was changed from what was requested (either via prop or isSelectionOnly)
            const isForcedFailure = question.isSelectionOnly && targetMode !== 'fourChoice';
            const isPreferenceFailure = !question.isSelectionOnly && targetMode !== preferredMode;

            if (isForcedFailure || isPreferenceFailure) {
                setShowFallback(true);
                const timer = setTimeout(() => setShowFallback(false), 3000);
                setActiveMode(targetMode);
                return () => clearTimeout(timer);
            }

            setActiveMode(targetMode);
        }
    }, [question, preferredMode, activeMode]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!answer.trim()) return;
        onSubmitAnswer(answer.trim());
        setAnswer('');
    };

    return (
        <Card className="border border-gray-300 w-full max-w-2xl mx-auto flex flex-col max-h-full overflow-hidden">
            <Stack gap="md" className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* Question */}
                <View className="py-2 text-center relative shrink-0">
                    {/* Fallback Notification */}
                    {showFallback && (
                        <View className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4 z-50 whitespace-nowrap border-2 border-white/20">
                            <Zap size={14} fill="white" />
                            {question.isSelectionOnly 
                                ? "この問題は4択のみ有効です。4択でお答えください。" 
                                : "モード未対応のため、最適な回答方式に切り替えました"}
                        </View>
                    )}
                    <Text variant="h3" weight="bold" className="leading-tight sm:leading-relaxed text-lg sm:text-2xl">
                        {question.questionText}
                    </Text>
                </View>

                {/* Answer Input */}
                <View className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
                    {activeMode === 'fourChoice' ? (
                        <View className="w-full max-w-lg">
                            <FourChoiceInput
                                correctAnswers={question.correctAnswers}
                                distractors={question.distractors || []}
                                onInput={(val) => {
                                    setAnswer(val);
                                    onSubmitAnswer(val);
                                }}
                            />
                        </View>
                    ) : activeMode === 'chips' ? (
                        <Stack gap="md" className="w-full max-w-md">
                            <View className="relative">
                                <Input
                                    readOnly
                                    value={answer}
                                    placeholder="回答中..."
                                    className="text-2xl py-8 shadow-inner bg-surface-base border-2 border-brand-primary text-center font-bold tracking-widest pointer-events-none"
                                />
                            </View>

                            <CharacterPoolInput
                                rubis={question.chipAnswer ? [question.chipAnswer] : []}
                                answers={question.correctAnswers}
                                currentInput={answer}
                                decoyCount={dummyCharCount}
                                distractors={question.distractors || []}
                                onInput={(char) => setAnswer(prev => prev + char)}
                            />

                            <Flex justify="center" gap="md" className="mt-4">
                                <Button variant="ghost" size="sm" onClick={() => setAnswer('')}>リセット</Button>
                                <Button
                                    variant="solid"
                                    color="primary"
                                    disabled={!answer.trim()}
                                    onClick={() => handleSubmit()}
                                >
                                    回答する
                                </Button>
                            </Flex>
                        </Stack>
                    ) : (
                        <View as="form" onSubmit={handleSubmit} className="w-full">
                            <Flex gap="sm">
                                <Input
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="回答を入力..."
                                    className="flex-1"
                                    autoFocus
                                />
                                <Button
                                    variant="solid" color="primary"
                                    type="submit"
                                    disabled={!answer.trim()}
                                    className="gap-1.5 shrink-0"
                                >
                                    <Send size={16} />
                                    回答
                                </Button>
                            </Flex>
                        </View>
                    )}
                </View>
            </Stack>
        </Card>
    );
}
