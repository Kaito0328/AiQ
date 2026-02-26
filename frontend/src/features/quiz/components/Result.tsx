"use client";

import React from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface ResultProps {
    isCorrect: boolean;
    correctAnswer: string;
    description?: string;
    onNext: () => void;
}

export function Result({ isCorrect, correctAnswer, description, onNext }: ResultProps) {
    return (
        <Card
            className={cn(
                "max-w-2xl mx-auto border-2 transition-colors",
                isCorrect ? "border-brand-success bg-brand-success/5" : "border-brand-danger bg-brand-danger/5"
            )}
        >
            <Stack gap="xl" align="center" className="py-6">
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
                    <View className="text-center">
                        <Text variant="xs" color="secondary">正解:</Text>
                        <Text variant="h3" weight="bold" color="primary">{correctAnswer}</Text>
                    </View>
                )}

                {/* Description */}
                {description && (
                    <View className="border-t border-gray-200 pt-4 w-full">
                        <Text variant="xs" color="secondary" weight="bold" className="mb-1">解説</Text>
                        <Text variant="detail" color="secondary" className="leading-relaxed">
                            {description}
                        </Text>
                    </View>
                )}

                {/* Next Button */}
                <Button
                    variant="solid" color="primary"
                    size="lg"
                    onClick={onNext}
                    className="gap-2 mt-2"
                >
                    次の問題へ
                    <ArrowRight size={18} />
                </Button>
            </Stack>
        </Card>
    );
}
