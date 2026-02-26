"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { Question } from '@/src/entities/question';
import { Eye, EyeOff, Trash2, Edit, Plus } from 'lucide-react';
import { deleteQuestion } from '@/src/features/questions/api';
import { cn } from '@/src/shared/utils/cn';

interface QuestionListProps {
    questions: Question[];
    isOwner: boolean;
    onQuestionDeleted: (questionId: string) => void;
    onEditQuestion: (question: Question) => void;
    onAddQuestion: () => void;
}

export function QuestionList({
    questions,
    isOwner,
    onQuestionDeleted,
    onEditQuestion,
    onAddQuestion,
}: QuestionListProps) {
    const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());
    const [allVisible, setAllVisible] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const toggleAnswer = (id: string) => {
        setVisibleAnswers(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleAllAnswers = () => {
        if (allVisible) {
            setVisibleAnswers(new Set());
        } else {
            setVisibleAnswers(new Set(questions.map(q => q.id)));
        }
        setAllVisible(!allVisible);
    };

    const handleDelete = async (questionId: string) => {
        if (!confirm('この問題を削除してもよろしいですか？')) return;
        setDeletingId(questionId);
        try {
            await deleteQuestion(questionId);
            onQuestionDeleted(questionId);
        } catch (err) {
            console.error('問題の削除に失敗しました', err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Stack gap="lg">
            <Flex justify="between" align="center">
                <Text variant="h3" weight="bold">問題一覧 ({questions.length})</Text>
                <Flex gap="sm">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={toggleAllAnswers}
                        className="gap-1.5 text-foreground/60"
                    >
                        {allVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        {allVisible ? '全て隠す' : '全て表示'}
                    </Button>
                    {isOwner && (
                        <Button
                            variant="solid" color="primary"
                            size="lg"
                            onClick={onAddQuestion}
                            className="gap-1.5"
                        >
                            <Plus size={16} />
                            問題を追加
                        </Button>
                    )}
                </Flex>
            </Flex>

            {questions.length === 0 ? (
                <Card className="border border-gray-300">
                    <View className="py-12 text-center">
                        <Text color="secondary">問題がまだありません</Text>
                        {isOwner && (
                            <Button
                                variant="solid" color="primary"
                                size="sm"
                                onClick={onAddQuestion}
                                className="mt-4 gap-1.5 mx-auto"
                            >
                                <Plus size={16} />
                                最初の問題を追加
                            </Button>
                        )}
                    </View>
                </Card>
            ) : (
                <Stack gap="md">
                    {questions.map((question, index) => {
                        const isVisible = visibleAnswers.has(question.id);
                        const isDeleting = deletingId === question.id;

                        return (
                            <Card
                                key={question.id}
                                className={cn(
                                    "border border-gray-300 transition-all",
                                    isDeleting && "opacity-50"
                                )}
                            >
                                <Stack gap="md">
                                    <Flex justify="between" align="start">
                                        <Flex gap="sm" align="start" className="flex-1">
                                            <Text
                                                variant="xs"
                                                weight="bold"
                                                className="bg-brand-primary text-white rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5"
                                            >
                                                {index + 1}
                                            </Text>
                                            <Text weight="medium" className="flex-1">
                                                {question.questionText}
                                            </Text>
                                        </Flex>

                                        <Flex gap="xs" className="shrink-0 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleAnswer(question.id)}
                                                className="p-1.5 h-auto text-foreground/50"
                                                title={isVisible ? '答えを隠す' : '答えを表示'}
                                            >
                                                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </Button>
                                            {isOwner && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEditQuestion(question)}
                                                        className="p-1.5 h-auto text-brand-primary"
                                                        title="編集"
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(question.id)}
                                                        className="p-1.5 h-auto text-brand-danger"
                                                        title="削除"
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </>
                                            )}
                                        </Flex>
                                    </Flex>

                                    {isVisible && (
                                        <View className="border-t border-surface-muted-border pt-3">
                                            <Stack gap="xs">
                                                <Flex gap="sm" align="start">
                                                    <Text variant="xs" weight="bold" color="primary" className="shrink-0">
                                                        答え:
                                                    </Text>
                                                    <Text variant="detail" weight="bold" color="primary">
                                                        {question.correctAnswer}
                                                    </Text>
                                                </Flex>
                                                {question.descriptionText && (
                                                    <Flex gap="sm" align="start">
                                                        <Text variant="xs" color="secondary" className="shrink-0">
                                                            解説:
                                                        </Text>
                                                        <Text variant="xs" color="secondary" className="leading-relaxed">
                                                            {question.descriptionText}
                                                        </Text>
                                                    </Flex>
                                                )}
                                            </Stack>
                                        </View>
                                    )}
                                </Stack>
                            </Card>
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
}
