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
import { Question } from '@/src/entities/question';
import { Home, CheckCircle, XCircle, Trophy, MessageSquare } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';
import { EditRequestModal } from '@/src/features/questions/components/EditRequestModal';
import { RankingQuizResultDto } from '@/src/features/quiz/api';

export default function QuizScorePage() {
    const router = useRouter();
    const [answers, setAnswers] = useState<AnswerHistory[]>([]);
    const [rankingResult, setRankingResult] = useState<RankingQuizResultDto | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedResult = sessionStorage.getItem('quizResult');
        if (storedResult) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRankingResult(JSON.parse(storedResult));
            sessionStorage.removeItem('quizResult');
        }

        const storedAnswers = sessionStorage.getItem('quizAnswers');
        if (storedAnswers) {
            setAnswers(JSON.parse(storedAnswers));
            // Keep quizAnswers for retry potential, but normally we'd clean up.
            // For now, let's keep it until they leave the page or retry.
        }

        // We'll keep quizData if we want to retry using the exact same settings,
        // but since we have answers, we can reconstruct it.
    }, []);

    const handleRetry = (onlyMistakes = false) => {
        const retryQuestions = onlyMistakes
            ? answers.filter(a => !a.correct).map(a => a.question)
            : answers.map(a => a.question);

        if (retryQuestions.length === 0) return;

        // Reconstruct quizData for app/quiz/page.tsx
        const quizData = {
            questions: retryQuestions,
            isRetry: true,
            // We can keep the same quiz settings or id if needed, 
            // but isRetry will flag the quiz page to skip submissions.
        };

        sessionStorage.setItem('quizData', JSON.stringify(quizData));
        router.push('/quiz');
    };

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

                            <Flex gap="md" wrap justify="center">
                                <Button
                                    variant="solid"
                                    color="primary"
                                    onClick={() => handleRetry(false)}
                                    className="gap-1.5"
                                >
                                    <Trophy size={16} />
                                    もう一度解く
                                </Button>
                                {answers.some(a => !a.correct) && (
                                    <Button
                                        variant="outline"
                                        color="primary"
                                        onClick={() => handleRetry(true)}
                                        className="gap-1.5"
                                    >
                                        <XCircle size={16} />
                                        間違えた問題のみ
                                    </Button>
                                )}
                                {rankingResult && (
                                    <Button
                                        variant="solid"
                                        color="secondary"
                                        onClick={() => router.push(`/collections/${rankingResult.collectionId}/ranking`)}
                                        className="gap-1.5"
                                    >
                                        <Trophy size={16} />
                                        ランキング
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push('/home')}
                                    className="gap-1.5 border border-surface-muted-border"
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
                                            <Flex justify="between" align="start">
                                                <Text weight="medium">{answer.question.questionText}</Text>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-[10px] gap-1 text-brand-primary hover:bg-brand-primary/10 border border-brand-primary/10"
                                                    onClick={() => setSelectedQuestion(answer.question)}
                                                >
                                                    <MessageSquare size={12} />
                                                    修正提案
                                                </Button>
                                            </Flex>
                                            <Flex gap="lg" align="center" wrap={true}>
                                                <Text variant="xs" color="secondary" as="span">
                                                    あなたの答え: <Text weight="bold" className="inline" as="span">{answer.userAnswer}</Text>
                                                </Text>
                                                {!answer.correct && answer.question.correctAnswers[0] !== '???' && (
                                                    <Text variant="xs" color="primary" as="span">
                                                        正解: <Text weight="bold" color="primary" className="inline" as="span">{answer.question.correctAnswers.join(' / ')}</Text>
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

            {selectedQuestion && (
                <EditRequestModal
                    question={selectedQuestion}
                    onClose={() => setSelectedQuestion(null)}
                />
            )}
        </View>
    );
}
