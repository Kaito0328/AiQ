"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Stack } from '@/src/design/primitives/Stack';
import { QuizForm } from '@/src/features/quiz/components/QuizForm';
import { Result } from '@/src/features/quiz/components/Result';
import { QuestionForm } from '@/src/features/questions/components/QuestionForm';
import { submitAnswer, submitRankingAllAnswers } from '@/src/features/quiz/api';
import { getCollection } from '@/src/features/collections/api';
import { Question } from '@/src/entities/question';
import { CasualQuiz, AnswerHistory } from '@/src/entities/quiz';
import { useAuth } from '@/src/shared/auth/useAuth';
import { useAiqScorer } from '@/src/features/quiz/hooks/useAiqScorer';

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
    const [isRetry, setIsRetry] = useState(false);
    const [ownedCollectionIds, setOwnedCollectionIds] = useState<Set<string>>(new Set());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [fuzzyScore, setFuzzyScore] = useState<number | null>(null);
    const { user } = useAuth();
    const scorer = useAiqScorer();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const stored = sessionStorage.getItem('quizData');
        if (stored) {
            const data = JSON.parse(stored);
            if (data.quizId && data.questions) {
                // Ranking Quiz (Bulk Mode)
                setRankingQuizId(data.quizId);

                const qs = data.questions.map((q: { id: string; questionText: string }) => ({
                    id: q.id,
                    questionText: q.questionText,
                    correctAnswers: ['???'], // Hide until the end
                    collectionId: data.collectionId
                }));
                setQuestions(qs);
            } else {
                // Casual Quiz
                setQuestions(data.questions || []);
                setQuiz(data.quiz || null);
                setIsRetry(!!data.isRetry);
            }
        }
    }, []);

    const judgeAnswer = useCallback((userAnswer: string, acceptableAnswers: string[]): boolean => {
        const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '');
        const normalizedUser = normalize(userAnswer);
        return acceptableAnswers.some(ans => normalize(ans) === normalizedUser);
    }, []);

    const currentQuestion = questions[currentIndex];

    // Check for ownership when question changes
    useEffect(() => {
        if (!user || !currentQuestion) return;
        const cid = currentQuestion.collectionId;
        if (!cid || ownedCollectionIds.has(cid)) return;

        const checkOwnership = async () => {
            try {
                const collection = await getCollection(cid);
                if (collection.userId === user.id) {
                    setOwnedCollectionIds(prev => new Set([...prev, cid]));
                }
            } catch (err) {
                console.error("Failed to check collection ownership", err);
            }
        };
        checkOwnership();
    }, [currentQuestion, user, ownedCollectionIds]);

    const handleAnswer = useCallback(async (userAnswerText: string) => {
        const q = questions[currentIndex];
        if (!q) return;

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
                setIsSubmitting(true);
                try {
                    const resp = await submitRankingAllAnswers(rankingQuizId, updatedAnswers.map(a => ({
                        questionId: a.question.id,
                        answer: a.userAnswer,
                        timeTakenMillis: 0,
                    })));

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
                                    correctAnswers: [result.correctAnswer],
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
        } else if (quiz || isRetry) {
            // Casual mode or Retry: Show feedback
            const acceptableAnswers = [...q.correctAnswers];
            if (q.answerRubis && q.answerRubis.length > 0) {
                acceptableAnswers.push(...q.answerRubis);
            }

            const exactCorrect = judgeAnswer(userAnswerText, acceptableAnswers);
            let correct = exactCorrect;

            if (!exactCorrect && quiz?.preferredMode === 'fuzzy') {
                const result = await scorer.evaluate(
                    q.questionText,
                    q.correctAnswers,
                    userAnswerText,
                    q.answerRubis
                );
                correct = result.correct;
                setFuzzyScore(result.topScore);
            } else if (quiz?.preferredMode === 'fuzzy') {
                // exact match in fuzzy mode — show 100%
                setFuzzyScore(1);
            } else {
                // non-fuzzy mode — never show similarity meter
                setFuzzyScore(null);
            }

            setIsCorrect(correct);

            const answer: AnswerHistory = {
                question: q,
                userAnswer: userAnswerText,
                correct,
            };
            setUserAnswers(prev => [...prev, answer]);

            try {
                if (!isRetry && quiz) {
                    await submitAnswer(quiz.id, {
                        questionId: q.id,
                        userAnswer: userAnswerText,
                        elapsedMillis: 0,
                    });
                }
            } catch (err) {
                console.error('Failed to submit casual answer', err);
            }
        }
    }, [questions, currentIndex, quiz, rankingQuizId, judgeAnswer, userAnswers, router, isRetry]);

    const handleNext = useCallback(() => {
        if (currentIndex + 1 >= questions.length) {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('quizAnswers', JSON.stringify(userAnswers));
            }
            router.push('/quiz/score');
        } else {
            setCurrentIndex(i => i + 1);
            setIsCorrect(null);
            setFuzzyScore(null);
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

    return (
        <div className="h-[100dvh] flex flex-col bg-surface-muted overflow-y-auto overflow-x-hidden">
            <div className="absolute top-4 left-4 z-50">
                <BackButton />
            </div>
            <View className="flex-1 flex items-center justify-center px-4 py-2 mt-12">
                {isCorrect !== null ? (
                    <Result
                        isCorrect={isCorrect}
                        correctAnswer={currentQuestion.correctAnswers.join(' / ')}
                        description={currentQuestion.descriptionText}
                        onNext={handleNext}
                        question={currentQuestion}
                        userAnswer={userAnswers[userAnswers.length - 1]?.userAnswer}
                        isOwner={ownedCollectionIds.has(currentQuestion.collectionId)}
                        onEdit={() => setIsEditModalOpen(true)}
                        fuzzyScore={fuzzyScore ?? undefined}
                    />
                ) : (
                    <QuizForm
                        key={currentIndex} // Reset form for each question
                        question={currentQuestion}
                        questionNumber={currentIndex + 1}
                        totalQuestions={questions.length}
                        preferredMode={quiz?.preferredMode === 'fuzzy' ? 'text' : quiz?.preferredMode}
                        dummyCharCount={quiz?.dummyCharCount}
                        onSubmitAnswer={handleAnswer}
                    />
                )}
            </View>

            {isEditModalOpen && currentQuestion && (
                <QuestionForm
                    collectionId={currentQuestion.collectionId}
                    question={currentQuestion}
                    onSaved={() => {
                        setIsEditModalOpen(false);
                        window.location.reload();
                    }}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
}
