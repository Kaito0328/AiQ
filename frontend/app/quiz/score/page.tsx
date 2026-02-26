"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Card } from '@/src/design/baseComponents/Card';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { AnswerHistory } from '@/src/entities/quiz';
import { Home, RotateCcw, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

export default function QuizScorePage() {
    const router = useRouter();
    const [answers, setAnswers] = useState<AnswerHistory[]>([]);
    const [rankingResult, setRankingResult] = useState<any>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedResult = sessionStorage.getItem('quizResult');
        if (storedResult) {
            setRankingResult(JSON.parse(storedResult));
            sessionStorage.removeItem('quizResult');
        }

        const storedAnswers = sessionStorage.getItem('quizAnswers');
        if (storedAnswers) {
            setAnswers(JSON.parse(storedAnswers));
            sessionStorage.removeItem('quizAnswers');
        }

        sessionStorage.removeItem('quizData');
    }, []);

    const correctCount = rankingResult ? rankingResult.correctCount : answers.filter(a => a.correct).length;
    const totalCount = rankingResult ? rankingResult.totalQuestions : answers.length;
    const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const score = rankingResult?.score;

    if (!rankingResult && answers.length === 0) {
        return (
            <View className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-muted">
                <Text variant="h2" weight="bold">結果データが見つかりません</Text>
                <Button variant="solid" color="primary" onClick={() => router.push('/home')}>
                    ホームに戻る
                </Button>
            </View>
        );
    }

    return (
        <View className="min-h-screen bg-surface-muted py-12">
            <Container>
                <Stack gap="xl">
                    {/* Score Summary */}
                    <Card className="border border-gray-300 text-center">
                        <Stack gap="lg" align="center" className="py-6">
                            <Trophy size={48} className="text-brand-primary" />
                            <Text variant="h1" weight="bold">クイズ完了！</Text>

                            <View className="text-center">
                                <Text
                                    variant="h1"
                                    weight="bold"
                                    className={cn(
                                        percentage >= 80 ? "text-brand-success" :
                                            percentage >= 50 ? "text-brand-warning" :
                                                "text-brand-danger"
                                    )}
                                >
                                    {score !== undefined ? `${score.toLocaleString()} pts` : `${percentage}%`}
                                </Text>
                                <Stack gap="xs" align="center">
                                    <Text color="secondary" variant="detail" weight="medium">
                                        {correctCount} / {totalCount} 正解
                                    </Text>
                                    {rankingResult?.rank && (
                                        <View className="bg-brand-primary/10 px-4 py-2 rounded-brand-full border border-brand-primary/20 animate-in fade-in zoom-in duration-500">
                                            <Flex gap="sm" align="center">
                                                <Trophy size={20} className="text-brand-primary" />
                                                <Text variant="h3" weight="bold" color="primary">
                                                    現在の順位: {rankingResult.rank}位
                                                </Text>
                                            </Flex>
                                        </View>
                                    )}
                                </Stack>
                            </View>

                            <Flex gap="md">
                                {rankingResult && (
                                    <Button
                                        variant="solid"
                                        color="primary"
                                        onClick={() => router.push(`/collections/${rankingResult.collectionId}/ranking`)}
                                        className="gap-1.5"
                                    >
                                        <Trophy size={16} />
                                        ランキングを見る
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/home')}
                                    className="gap-1.5"
                                >
                                    <Home size={16} />
                                    ホーム
                                </Button>
                            </Flex>
                        </Stack>
                    </Card>

                    {/* Answer History (Only if available) */}
                    {answers.length > 0 && (
                        <Stack gap="md">
                            <Text variant="h3" weight="bold">回答一覧</Text>
                            {answers.map((answer, index) => (
                                <Card
                                    key={index}
                                    className={cn(
                                        "border-2",
                                        answer.correct
                                            ? "border-brand-success/30 bg-brand-success/5"
                                            : "border-brand-danger/30 bg-brand-danger/5"
                                    )}
                                >
                                    <Flex gap="md" align="start">
                                        <View className="mt-1 shrink-0">
                                            {answer.correct ? (
                                                <CheckCircle size={20} className="text-brand-success" />
                                            ) : (
                                                <XCircle size={20} className="text-brand-danger" />
                                            )}
                                        </View>
                                        <Stack gap="xs" className="flex-1">
                                            <Text weight="medium">{answer.question.questionText}</Text>
                                            <Flex gap="lg" align="center" wrap={true}>
                                                <Text variant="xs" color="secondary" as="span">
                                                    あなたの答え: <Text weight="bold" className="inline" as="span">{answer.userAnswer}</Text>
                                                </Text>
                                                {!answer.correct && answer.question.correctAnswer !== '???' && (
                                                    <Text variant="xs" color="primary" as="span">
                                                        正解: <Text weight="bold" color="primary" className="inline" as="span">{answer.question.correctAnswer}</Text>
                                                    </Text>
                                                )}
                                            </Flex>
                                        </Stack>
                                    </Flex>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Container>
        </View>
    );
}
