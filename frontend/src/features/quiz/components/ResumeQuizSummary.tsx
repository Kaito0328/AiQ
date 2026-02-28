"use client";

import React, { useEffect, useState } from 'react';
import { getResumableQuizzes } from '@/src/features/quiz/api';
import { CasualQuiz } from '@/src/entities/quiz';
import { Card } from '@/src/design/baseComponents/Card';
import { Text } from '@/src/design/baseComponents/Text';
import { Flex } from '@/src/design/primitives/Flex';
import { History, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Grid } from '@/src/design/primitives/Grid';
import { Stack } from '@/src/design/primitives/Stack';
import { View } from '@/src/design/primitives/View';
import { useAuth } from '@/src/shared/auth/useAuth';

export function ResumeQuizSummary() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState<CasualQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchQuizzes = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const data = await getResumableQuizzes();
                // 日付順にソート
                const sorted = [...data].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setQuizzes(sorted);
            } catch (err) {
                console.error('Failed to fetch resumable quizzes', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [user]);

    if (!user || loading) return null;
    if (quizzes.length === 0) {
        return (
            <Card border="primary" bg="transparent" className="border-dashed py-4">
                <Flex gap="sm" align="center" justify="center" className="opacity-40">
                    <History size={20} />
                    <Text variant="xs" weight="medium">最近の活動はありません。新しいクイズを始めてみましょう！</Text>
                </Flex>
            </Card>
        );
    }

    const MAX_DISPLAY = 3;
    const displayQuizzes = quizzes.length > MAX_DISPLAY
        ? quizzes.slice(0, MAX_DISPLAY - 1)
        : quizzes;
    const hasMore = quizzes.length > MAX_DISPLAY;

    return (
        <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="md">
            {displayQuizzes.map((quiz) => (
                <Card
                    key={quiz.id}
                    onClick={() => router.push(`/quiz/resume?id=${quiz.id}`)}
                    border="primary"
                    bg="card"
                    padding="sm"
                    className="cursor-pointer hover:bg-surface-primary transition-all hover:shadow-md group"
                >
                    <Flex gap="sm" align="center" className="h-full px-1">
                        <Stack gap="xs" className="min-w-0 flex-1">
                            <Text variant="detail" weight="bold" className="line-clamp-1 transition-colors group-hover:text-brand-primary">
                                {quiz.collectionNames.join(', ')}
                            </Text>
                            <Text variant="xs" color="secondary" weight="medium">
                                進捗: {quiz.answeredQuestionIds.length} / {quiz.totalQuestions}
                            </Text>
                        </Stack>
                    </Flex>
                </Card>
            ))}

            {hasMore && (
                <Card
                    onClick={() => router.push('/quiz/resume')}
                    border="primary"
                    bg="transparent"
                    padding="sm"
                    className="cursor-pointer hover:bg-brand-primary/5 transition-all text-brand-primary border-dashed flex items-center justify-center min-h-[60px]"
                >
                    <Flex gap="xs" align="center">
                        <Text variant="detail" weight="bold">他 {quizzes.length - (MAX_DISPLAY - 1)} 件を見る</Text>
                        <ChevronRight size={16} />
                    </Flex>
                </Card>
            )}
        </Grid>
    );
}
