"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { View } from '@/src/design/primitives/View';
import { Question, QuestionInput } from '@/src/entities/question';
import { createQuestion, updateQuestion } from '@/src/features/questions/api';
import { X } from 'lucide-react';

interface QuestionFormProps {
    collectionId: string;
    question?: Question; // 編集時に既存の問題を渡す
    onSaved: (question: Question) => void;
    onCancel: () => void;
}

export function QuestionForm({ collectionId, question, onSaved, onCancel }: QuestionFormProps) {
    const isEditing = !!question;
    const [input, setInput] = useState<QuestionInput>({
        questionText: question?.questionText || '',
        correctAnswer: question?.correctAnswer || '',
        descriptionText: question?.descriptionText || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.questionText.trim() || !input.correctAnswer.trim()) {
            setError('問題文と正解は必須です');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let result: Question;
            if (isEditing && question) {
                result = await updateQuestion(question.id, input);
            } else {
                result = await createQuestion(collectionId, input);
            }
            onSaved(result);
        } catch (err) {
            console.error('問題の保存に失敗しました', err);
            setError('保存に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-lg mx-4 border border-gray-300">
                <form onSubmit={handleSubmit}>
                    <Stack gap="lg">
                        <Flex justify="between" align="center">
                            <Text variant="h3" weight="bold">
                                {isEditing ? '問題を編集' : '問題を追加'}
                            </Text>
                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={onCancel}
                                className="p-1 h-auto"
                            >
                                <X size={20} />
                            </Button>
                        </Flex>

                        <Stack gap="md">
                            <Stack gap="xs">
                                <Text variant="xs" weight="bold">問題文 *</Text>
                                <Input
                                    value={input.questionText}
                                    onChange={(e) => setInput({ ...input, questionText: e.target.value })}
                                    placeholder="問題文を入力してください"
                                />
                            </Stack>

                            <Stack gap="xs">
                                <Text variant="xs" weight="bold">正解 *</Text>
                                <Input
                                    value={input.correctAnswer}
                                    onChange={(e) => setInput({ ...input, correctAnswer: e.target.value })}
                                    placeholder="正解を入力してください（複数の場合はカンマ区切り）"
                                />
                            </Stack>

                            <Stack gap="xs">
                                <Text variant="xs" weight="bold">解説（任意）</Text>
                                <Input
                                    value={input.descriptionText}
                                    onChange={(e) => setInput({ ...input, descriptionText: e.target.value })}
                                    placeholder="解説を入力してください"
                                />
                            </Stack>
                        </Stack>

                        {error && (
                            <Text variant="xs" color="danger">{error}</Text>
                        )}

                        <Flex gap="sm" justify="end">
                            <Button variant="outline" type="button" onClick={onCancel}>
                                キャンセル
                            </Button>
                            <Button variant="solid" color="primary" type="submit" disabled={loading}>
                                {loading ? '保存中...' : (isEditing ? '更新' : '追加')}
                            </Button>
                        </Flex>
                    </Stack>
                </form>
            </Card>
        </View>
    );
}
