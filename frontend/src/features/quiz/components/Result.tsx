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
}

export function Result({ isCorrect, correctAnswer, description, onNext, question }: ResultProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <Stack gap="lg" className="w-full max-w-2xl mx-auto">
            <Card
                className={cn(
                    "border-2 transition-colors shadow-lg",
                    isCorrect ? "border-brand-success bg-brand-success/5" : "border-brand-danger bg-brand-danger/5"
                )}
            >
                <Stack gap="xl" align="center" className="py-8 px-6">
                    {/* Icon + Result */}
                    <Flex gap="md" align="center">
                        {isCorrect ? (
                            <CheckCircle size={48} className="text-brand-success" />
                        ) : (
                            <XCircle size={48} className="text-brand-danger" />
                        )}
                        <Text variant="h1" weight="bold" className={isCorrect ? "text-brand-success" : "text-brand-danger"}>
                            {isCorrect ? '正解！' : '不正解'}
                        </Text>
                    </Flex>

                    {/* Correct Answer */}
                    {!isCorrect && (
                        <View className="text-center bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10 w-full">
                            <Text variant="xs" color="secondary" weight="bold">正解</Text>
                            <Text variant="h3" weight="bold" color="primary" className="mt-1">{correctAnswer}</Text>
                        </View>
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
                                onClick={() => setIsEditModalOpen(true)}
                                className="gap-2 flex-1 sm:flex-none border border-brand-primary/20"
                            >
                                <MessageSquare size={18} />
                                修正提案
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
