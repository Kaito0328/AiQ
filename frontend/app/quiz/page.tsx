"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Stack } from '@/src/design/primitives/Stack';
import { QuizForm } from '@/src/features/quiz/components/QuizForm';
import { Result } from '@/src/features/quiz/components/Result';
import { submitAnswer, submitRankingAllAnswers } from '@/src/features/quiz/api';
import { Question } from '@/src/entities/question';
import { CasualQuiz, AnswerHistory } from '@/src/entities/quiz';

import { BackButton } from '@/src/shared/components/Navigation/BackButton';

export default function QuizPage() {
    const router = useRouter();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [quiz, setQuiz] = useState<CasualQuiz | null>(null);
    const [rankingQuizId, setRankingQuizId] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [userAnswers, setUserAnswers] = useState<AnswerHistory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = sessionStorage.getItem('quizData');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.quizId && data.questions) {
                // Ranking Quiz (Bulk Mode)
                setRankingQuizId(data.quizId);
                const qs = data.questions.map((q: any) => ({
                    id: q.id,
                    questionText: q.questionText,
                    correctAnswer: '???', // Hide until the end
                    collectionId: data.collectionId
                }));
                setQuestions(qs);
            } else {
                // Casual Quiz
                setQuestions(data.questions || []);
                setQuiz(data.quiz || null);
            }
        }
    }, []);

    const judgeAnswer = useCallback((userAnswer: string, correctAnswer: string): boolean => {
        const normalized = userAnswer.trim().toLowerCase();
        const correctAnswers = correctAnswer
            .split(/[,|]/)
            .map(ans => ans.trim().toLowerCase());
        return correctAnswers.includes(normalized);
    }, []);

    const handleAnswer = useCallback(async (userAnswerText: string) => {
        const q = questions[currentIndex];

        if (rankingQuizId) {
            // Ranking Mode: Just store answer and move to next (no feedback)
            const answer: AnswerHistory = {
                question: q,
                userAnswer: userAnswerText,
                correct: false, // Don't know yet
            };
            const updatedAnswers = [...userAnswers, answer];
            setUserAnswers(updatedAnswers);

            if (currentIndex + 1 >= questions.length) {
                // Finish and submit all
                setIsSubmitting(true);
                try {
                    const submission = updatedAnswers.map(a => ({
                        question_id: a.question.id,
                        answer: a.userAnswer,
                        time_taken_millis: 0, // Could add timer here
                    }));

                    // Note: We need to use camelCase for the API client if it handles conversion, 
                    // or snake_case if it doesn't. Based on api/index.ts, we use camelCase in TS.
                    const resp = await submitRankingAllAnswers(rankingQuizId, updatedAnswers.map(a => ({
                        questionId: a.question.id,
                        answer: a.userAnswer,
                        timeTakenMillis: 0,
                    })));

                    // Enrich answers with actual results from backend
                    const enrichedAnswers = updatedAnswers.map(a => {
                        const results = resp.detailedResults || [];
                        const result = results.find(r =>
                            r.questionId.toLowerCase() === a.question.id.toLowerCase()
                        );

                        if (result) {
                            return {
                                ...a,
                                correct: result.isCorrect,
                                question: {
                                    ...a.question,
                                    correctAnswer: result.correctAnswer,
                                }
                            };
                        } else {
                            return a;
                        }
                    });

                    sessionStorage.setItem('quizResult', JSON.stringify(resp));
                    sessionStorage.setItem('quizAnswers', JSON.stringify(enrichedAnswers));
                    router.push('/quiz/score');
                } catch (err) {
                    console.error('Failed to submit ranking answers', err);
                    alert('回答の送信に失敗しました。');
                    setIsSubmitting(false);
                }
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        } else if (quiz) {
            // Casual mode: Show feedback
            const correct = judgeAnswer(userAnswerText, q.correctAnswer);
            setIsCorrect(correct);

            const answer: AnswerHistory = {
                question: q,
                userAnswer: userAnswerText,
                correct,
            };
            setUserAnswers(prev => [...prev, answer]);

            try {
                await submitAnswer(quiz.id, {
                    questionId: q.id,
                    userAnswer: userAnswerText,
                    elapsedMillis: 0,
                });
            } catch (err) {
                console.error('Failed to submit casual answer', err);
            }
        }
    }, [questions, currentIndex, quiz, rankingQuizId, judgeAnswer, userAnswers, router]);

    const handleNext = useCallback(() => {
        if (currentIndex + 1 >= questions.length) {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('quizAnswers', JSON.stringify(userAnswers));
            }
            router.push('/quiz/score');
        } else {
            setCurrentIndex(i => i + 1);
            setIsCorrect(null);
        }
    }, [currentIndex, questions, userAnswers, router]);

    if (isSubmitting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-surface-muted">
                <Stack gap="md" align="center">
                    <View className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <Text weight="bold">結果を送信中...</Text>
                </Stack>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-surface-muted">
                <BackButton />
                <View className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Text variant="h2" weight="bold">クイズデータが見つかりません</Text>
                    <Text color="secondary">クイズはスタート画面から始めてください。</Text>
                    <Button variant="solid" color="primary" onClick={() => router.push('/home')}>
                        ホームに戻る
                    </Button>
                </View>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="min-h-screen flex flex-col bg-surface-muted pt-20">
            <BackButton />
            <View className="flex-1 flex items-center justify-center px-4">
                {isCorrect !== null ? (
                    <Result
                        isCorrect={isCorrect}
                        correctAnswer={currentQuestion.correctAnswer}
                        description={currentQuestion.descriptionText}
                        onNext={handleNext}
                    />
                ) : (
                    <QuizForm
                        key={currentIndex} // Reset form for each question
                        questionText={currentQuestion.questionText}
                        questionNumber={currentIndex + 1}
                        totalQuestions={questions.length}
                        onSubmitAnswer={handleAnswer}
                    />
                )}
            </View>
        </div>
    );
}
