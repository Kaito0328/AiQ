"use client";

import React, { useEffect, useState } from 'react';
import { getResumableQuizzes, resumeQuiz } from '@/src/features/quiz/api';
import { CasualQuiz } from '@/src/entities/quiz';
import { Card } from '@/src/design/baseComponents/Card';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { Stack } from '@/src/design/primitives/Stack';
import { PlayCircle, History, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { cn } from '@/src/shared/utils/cn';
import { SectionHeader } from '@/src/shared/components/SectionHeader';
import { Grid } from '@/src/design/primitives/Grid';

/**
 * 中断されたクイズの一覧を表示し、再開できるようにするコンポーネントです。
 */
export function ResumeQuizList() {
    const [quizzes, setQuizzes] = useState<CasualQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [isResuming, setIsResuming] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const data = await getResumableQuizzes();
                // 日付順（新しい順）に並べ替え
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
    }, []);

    const handleResume = async (quizId: string) => {
        setIsResuming(quizId);
        try {
            const resp = await resumeQuiz(quizId);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('quizData', JSON.stringify(resp));
            }
            router.push('/quiz');
        } catch (err) {
            console.error('Failed to resume quiz', err);
            setIsResuming(null);
        }
    };

    if (loading) return (
        <Flex justify="center" className="py-8">
            <Spinner size="sm" />
        </Flex>
    );

    if (quizzes.length === 0) return null;

    return (
        <Stack gap="lg">
            <SectionHeader
                icon={History}
                title="学習を再開する"
                description={`中断したクイズが ${quizzes.length} 件あります`}
            />

            <Grid cols={{ sm: 1, md: 2 }} gap="md">
                {quizzes.map((quiz) => {
                    const progress = Math.round((quiz.answeredQuestionIds.length / quiz.totalQuestions) * 100);

                    return (
                        <Card
                            key={quiz.id}
                            className="p-1 border-brand-primary/10 bg-surface-primary hover:border-brand-primary/30 transition-all hover:shadow-md group"
                        >
                            <Stack gap="none">
                                <View className="p-4">
                                    <Stack gap="xs">
                                        <Text weight="bold" variant="detail" className="line-clamp-1 group-hover:text-brand-primary transition-colors">
                                            {quiz.collectionNames.join(', ')}
                                        </Text>
                                        <Flex justify="between" align="center">
                                            <Text variant="xs" color="secondary" weight="medium">
                                                進捗: {quiz.answeredQuestionIds.length} / {quiz.totalQuestions} 問
                                            </Text>
                                            <Text variant="xs" color="primary" weight="bold">
                                                {progress}%
                                            </Text>
                                        </Flex>
                                        {/* プログレスバー */}
                                        <View className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                                            <View
                                                className="h-full bg-brand-primary transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </View>
                                    </Stack>
                                </View>

                                <View
                                    as="button"
                                    onClick={() => handleResume(quiz.id)}
                                    disabled={!!isResuming}
                                    className={cn(
                                        "w-full py-3 px-4 flex items-center justify-between text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 transition-colors border-t border-brand-primary/5",
                                        isResuming === quiz.id && "opacity-70 cursor-wait"
                                    )}
                                >
                                    <Flex gap="sm" align="center">
                                        <PlayCircle size={18} />
                                        <Text variant="xs" weight="bold">
                                            {isResuming === quiz.id ? '再開中...' : 'つづきから'}
                                        </Text>
                                    </Flex>
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </View>
                            </Stack>
                        </Card>
                    );
                })}
            </Grid >
        </Stack>
    );
}
