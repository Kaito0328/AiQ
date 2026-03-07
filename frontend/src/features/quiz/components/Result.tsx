"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { CheckCircle, XCircle, ArrowRight, MessageSquare } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { Question } from '@/src/entities/question';
import { EditRequestModal } from '@/src/features/questions/components/EditRequestModal';

interface ResultProps {
    isCorrect: boolean;
    correctAnswer: string;
    description?: string;
    onNext: () => void;
    question?: Question;
    userAnswer?: string;
    isOwner?: boolean;
    onEdit?: () => void;
    fuzzyScore?: number; // 0-1 similarity from AI scorer (fuzzy mode only)
}

export function Result({ isCorrect, correctAnswer, description, onNext, question, userAnswer, isOwner, onEdit, fuzzyScore }: ResultProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEditClick = () => {
        if (isOwner && onEdit) {
            onEdit();
        } else {
            setIsEditModalOpen(true);
        }
    };

    return (
        <Stack gap="lg" className="w-full max-w-2xl mx-auto">
            <Card
                className={cn(
                    "border-2 transition-colors shadow-lg",
                    isCorrect ? "border-brand-success bg-brand-success/5" : "border-brand-danger bg-brand-danger/5"
                )}
            >
                <Stack gap="xl" align="center" className="py-8 px-6">
                    {/* Question Text */}
                    {question && (
                        <Text variant="h3" weight="bold" className="text-center w-full leading-relaxed border-b border-surface-muted/50 pb-4">
                            Q. {question.questionText}
                        </Text>
                    )}

                    {/* Icon + Result */}
                    <Flex gap="md" align="center" className="animate-in zoom-in fade-in duration-500">
                        {isCorrect ? (
                            <CheckCircle size={56} className="text-brand-success animate-in bounce-in duration-700" />
                        ) : (
                            <XCircle size={56} className="text-brand-danger animate-in shake-in duration-500" />
                        )}
                        <Text variant="h1" weight="bold" className={cn("text-5xl", isCorrect ? "text-brand-success" : "text-brand-danger")}>
                            {isCorrect ? '正解！' : '不正解'}
                        </Text>
                    </Flex>

                    {/* Answers Comparison */}
                    <Stack gap="md" className="w-full text-center bg-surface-base p-4 rounded-xl border border-surface-muted">
                        <View>
                            <Text variant="xs" color="secondary" weight="bold">あなたの回答</Text>
                            <Text variant="h3" weight="bold" className={cn("mt-1", isCorrect ? "text-brand-success" : "text-brand-danger")}>
                                {userAnswer || '(未回答)'}
                            </Text>
                        </View>
                        <View className="pt-4 border-t border-surface-muted/50">
                            <Text variant="xs" color="secondary" weight="bold">
                                {isCorrect ? '正解の候補' : '正解'}
                            </Text>
                            <Text
                                variant={isCorrect ? 'detail' : 'h3'}
                                weight="bold"
                                color="primary"
                                className="mt-1"
                            >
                                {correctAnswer}
                            </Text>
                        </View>
                    </Stack>

                    {/* Fuzzy similarity meter (fuzzy mode only) */}
                    {fuzzyScore !== undefined && (
                        (() => {
                            const pct = Math.round(fuzzyScore * 100);
                            const radius = 28;
                            const circumference = 2 * Math.PI * radius;
                            const dash = (pct / 100) * circumference;
                            const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
                            return (
                                <Flex direction="column" align="center" gap="xs" className="pt-4 border-t border-surface-muted/50">
                                    <Text variant="xs" color="secondary" weight="bold">AI類似度</Text>
                                    <View className="relative w-20 h-20">
                                        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                                            <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor"
                                                strokeWidth="6" className="text-surface-muted" />
                                            <circle cx="32" cy="32" r={radius} fill="none"
                                                stroke={color} strokeWidth="6"
                                                strokeDasharray={`${dash} ${circumference}`}
                                                strokeLinecap="round"
                                                style={{ transition: 'stroke-dasharray 0.6s ease' }}
                                            />
                                        </svg>
                                        <View className="absolute inset-0 flex items-center justify-center">
                                            <Text variant="xs" weight="bold" style={{ color }}>{pct}%</Text>
                                        </View>
                                    </View>
                                    <Text variant="xs" color="secondary">
                                        {pct >= 80 ? '✅ 閾値クリア' : `閾値まで ${80 - pct}%`}
                                    </Text>
                                </Flex>
                            );
                        })()
                    )}

                    {/* Description */}
                    {description && (
                        <View className="border-t border-surface-muted pt-6 w-full">
                            <Text variant="xs" color="secondary" weight="bold" className="mb-2 flex items-center gap-1">
                                <MessageSquare size={14} />
                                解説
                            </Text>
                            <Text variant="detail" color="secondary" className="leading-relaxed bg-surface-muted/30 p-4 rounded-lg">
                                {description}
                            </Text>
                        </View>
                    )}

                    {/* Actions */}
                    <Flex gap="md" className="w-full mt-4" wrap justify="center">
                        {question && (
                            <Button
                                variant="ghost"
                                color="primary"
                                size="lg"
                                onClick={handleEditClick}
                                className="gap-2 flex-1 sm:flex-none border border-brand-primary/20"
                            >
                                <MessageSquare size={18} />
                                {isOwner ? '問題を編集' : '修正提案'}
                            </Button>
                        )}
                        <Button
                            variant="solid"
                            color="primary"
                            size="lg"
                            onClick={onNext}
                            className="gap-2 flex-1 sm:flex-none shadow-md shadow-brand-primary/20"
                        >
                            次の問題へ
                            <ArrowRight size={18} />
                        </Button>
                    </Flex>
                </Stack>
            </Card>

            {isEditModalOpen && question && (
                <EditRequestModal
                    question={question}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </Stack>
    );
}
