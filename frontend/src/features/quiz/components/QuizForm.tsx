"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { View } from '@/src/design/primitives/View';
import { Send, AlertCircle } from 'lucide-react';
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

export function QuizForm({ question, questionNumber, totalQuestions, onSubmitAnswer, preferredMode = 'text', dummyCharCount = AppConfig.quiz.default_dummy_char_count }: QuizFormProps) {
    const [answer, setAnswer] = useState('');
    const [activeMode, setActiveMode] = useState<string>(preferredMode);
    const [showFallback, setShowFallback] = useState(false);

    // Mode fallback and Omakase logic
    useEffect(() => {
        // 1. Initial mode choice
        let targetMode = (question.preferredMode && question.preferredMode !== 'default')
            ? (question.preferredMode as string)
            : preferredMode;

        // 2. Omakase (Auto) Logic
        if (targetMode === 'omakase') {
            const rec = question.recommendedMode;
            if (rec === 'fourChoice' || rec === 'choice') {
                targetMode = 'fourChoice';
            } else if (rec === 'text' || rec === 'recall') {
                targetMode = 'text';
            } else if (rec === 'chips') {
                targetMode = 'chips';
            } else {
                // Default: Try chips first (will fallback to text if incompatible)
                targetMode = 'chips';
            }
        }

        // 3. Compatibility Checks & Fallbacks

        // 4-choice fallback: needs distractors
        if (targetMode === 'fourChoice' && (!question.distractors || question.distractors.length === 0)) {
            targetMode = 'text';
        }

        // Chips fallback: needs compatible answer (has rubi or no kanji)
        if (targetMode === 'chips') {
            const isSimpleText = (text: string) => !/[一-龠々]/.test(text);
            const hasRubis = question.answerRubis && question.answerRubis.length > 0;
            const hasSimpleAnswers = question.correctAnswers && question.correctAnswers.some(isSimpleText);

            // 漢字に読みがない場合はテキスト入力に切り替え
            if (!hasRubis && !hasSimpleAnswers) {
                targetMode = 'text';
            }
        }

        if (targetMode !== activeMode) {
            // If the user's PRECISE request (not omakase) failed, show fallback warning
            const isManualFailure = preferredMode !== 'omakase' && targetMode !== preferredMode && question.preferredMode === 'default';
            const isQuestionFailure = question.preferredMode !== 'default' && targetMode !== question.preferredMode;

            if (isManualFailure || isQuestionFailure) {
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
                {/* Progress */}
                <Flex justify="between" align="center" className="shrink-0">
                    <Text variant="xs" color="secondary" weight="bold">
                        問題 {questionNumber} / {totalQuestions}
                    </Text>
                    <View
                        className="h-2 flex-1 mx-4 bg-surface-muted rounded-full overflow-hidden"
                    >
                        <View
                            className="h-full bg-brand-primary rounded-full transition-all duration-500"
                            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                        />
                    </View>
                </Flex>

                {/* Question */}
                <View className="py-4 sm:py-8 text-center relative shrink-0">
                    {/* Fallback Notification */}
                    {showFallback && (
                        <View className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand-primary text-white text-[10px] font-bold rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 z-10">
                            <AlertCircle size={12} />
                            モード未対応のためテキスト入力に切り替えました
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
                                rubis={question.answerRubis}
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
