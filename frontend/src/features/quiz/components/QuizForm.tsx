"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { View } from '@/src/design/primitives/View';
import { Send } from 'lucide-react';

interface QuizFormProps {
    questionText: string;
    questionNumber: number;
    totalQuestions: number;
    onSubmitAnswer: (answer: string) => void;
}

export function QuizForm({ questionText, questionNumber, totalQuestions, onSubmitAnswer }: QuizFormProps) {
    const [answer, setAnswer] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) return;
        onSubmitAnswer(answer.trim());
        setAnswer('');
    };

    return (
        <Card className="border border-gray-300 max-w-2xl mx-auto">
            <Stack gap="xl">
                {/* Progress */}
                <Flex justify="between" align="center">
                    <Text variant="xs" color="secondary" weight="bold">
                        問題 {questionNumber} / {totalQuestions}
                    </Text>
                    <View
                        className="h-2 flex-1 mx-4 bg-gray-200 rounded-full overflow-hidden"
                    >
                        <View
                            className="h-full bg-brand-primary rounded-full transition-all duration-500"
                            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                        />
                    </View>
                </Flex>

                {/* Question */}
                <View className="py-8 text-center">
                    <Text variant="h2" weight="bold" className="leading-relaxed">
                        {questionText}
                    </Text>
                </View>

                {/* Answer Input */}
                <form onSubmit={handleSubmit}>
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
                </form>
            </Stack>
        </Card>
    );
}
