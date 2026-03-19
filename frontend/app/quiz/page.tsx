"use client";
import { logger } from "@/src/shared/utils/logger";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { View } from "@/src/design/primitives/View";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { Stack } from "@/src/design/primitives/Stack";
import { QuizForm } from "@/src/features/quiz/components/QuizForm";
import { Result } from "@/src/features/quiz/components/Result";
import { QuestionForm } from "@/src/features/questions/components/QuestionForm";
import { getCollectionQuestions } from "@/src/features/questions/api";
import { submitAnswer, submitRankingAllAnswers } from "@/src/features/quiz/api";
import { getCollection } from "@/src/features/collections/api";
import { Question } from "@/src/entities/question";
import { CasualQuiz, AnswerHistory } from "@/src/entities/quiz";
import { useAuth } from "@/src/shared/auth/useAuth";
import { useAiqScorer } from "@/src/features/quiz/hooks/useAiqScorer";

import { BackButton } from "@/src/shared/components/Navigation/BackButton";
import { X, ArrowRight } from "lucide-react";

interface InitialQuizState {
  questions: Question[];
  quiz: CasualQuiz | null;
  rankingQuizId: string | null;
  currentIndex: number;
  userAnswers: AnswerHistory[];
  isRetry: boolean;
}

function readInitialQuizState(): InitialQuizState {
  const defaults: InitialQuizState = {
    questions: [],
    quiz: null,
    rankingQuizId: null,
    currentIndex: 0,
    userAnswers: [],
    isRetry: false,
  };

  if (typeof window === "undefined") {
    return defaults;
  }

  const stored = sessionStorage.getItem("quizData");
  if (!stored) {
    return defaults;
  }

  try {
    const data = JSON.parse(stored);

    if (data.quizId && data.questions) {
      const rankingQuestions: Question[] = data.questions.map(
        (q: { id: string; questionText: string }) => ({
          id: q.id,
          questionText: q.questionText,
          correctAnswers: ["???"],
          collectionId: data.collectionId,
        }),
      );

      return {
        ...defaults,
        questions: rankingQuestions,
        rankingQuizId: data.quizId,
      };
    }

    const casualQuestions: Question[] = data.questions || [];
    const answeredCount = data.quiz?.answeredQuestionIds?.length || 0;

    return {
      ...defaults,
      questions: casualQuestions,
      quiz: data.quiz || null,
      currentIndex:
        answeredCount > 0 && answeredCount < casualQuestions.length
          ? answeredCount
          : 0,
      userAnswers: data.answers || [],
      isRetry: !!data.isRetry,
    };
  } catch {
    return defaults;
  }
}

export default function QuizPage() {
  const router = useRouter();

  const [initialState] = useState<InitialQuizState>(() =>
    readInitialQuizState(),
  );

  const [questions, setQuestions] = useState<Question[]>(
    initialState.questions,
  );
  const [quiz] = useState<CasualQuiz | null>(initialState.quiz);
  const [rankingQuizId] = useState<string | null>(initialState.rankingQuizId);
  const [currentIndex, setCurrentIndex] = useState(initialState.currentIndex);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [userAnswers, setUserAnswers] = useState<AnswerHistory[]>(
    initialState.userAnswers,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetry] = useState(initialState.isRetry);
  const [ownedCollectionIds, setOwnedCollectionIds] = useState<Set<string>>(
    new Set(),
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fuzzyScore, setFuzzyScore] = useState<number | null>(null);
  const { user } = useAuth();
  const scorer = useAiqScorer();

  const judgeAnswer = useCallback(
    (userAnswer: string, acceptableAnswers: string[]): boolean => {
      const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
      const normalizedUser = normalize(userAnswer);
      return acceptableAnswers.some((ans) => normalize(ans) === normalizedUser);
    },
    [],
  );

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
          setOwnedCollectionIds((prev) => new Set([...prev, cid]));
        }
      } catch (err) {
        logger.error("Failed to check collection ownership", err);
      }
    };
    checkOwnership();
  }, [currentQuestion, user, ownedCollectionIds]);

  const handleAnswer = useCallback(
    async (userAnswerText: string) => {
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
            const resp = await submitRankingAllAnswers(
              rankingQuizId,
              updatedAnswers.map((a) => ({
                questionId: a.question.id,
                answer: a.userAnswer,
                timeTakenMillis: 0,
              })),
            );

            const enrichedAnswers = updatedAnswers.map((a) => {
              const results = resp.detailedResults || [];
              const result = results.find(
                (r) =>
                  r.questionId.toLowerCase() === a.question.id.toLowerCase(),
              );

              if (result) {
                return {
                  ...a,
                  correct: result.isCorrect,
                  question: {
                    ...a.question,
                    correctAnswers: [result.correctAnswer],
                  },
                };
              } else {
                return a;
              }
            });

            sessionStorage.setItem("quizResult", JSON.stringify(resp));
            sessionStorage.setItem(
              "quizAnswers",
              JSON.stringify(enrichedAnswers),
            );
            router.push("/quiz/score");
          } catch (err) {
            logger.error("Failed to submit ranking answers", err);
            alert("回答の送信に失敗しました。");
            setIsSubmitting(false);
          }
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (quiz || isRetry) {
        // Casual mode or Retry: Show feedback
        const acceptableAnswers = [...q.correctAnswers];
        if (q.answerRubis && q.answerRubis.length > 0) {
          acceptableAnswers.push(...q.answerRubis);
        }

        const exactCorrect = judgeAnswer(userAnswerText, acceptableAnswers);
        let correct = exactCorrect;

        if (!exactCorrect && quiz?.preferredMode === "fuzzy") {
          const result = await scorer.evaluate(
            q.questionText,
            q.correctAnswers,
            userAnswerText,
            q.answerRubis,
          );
          correct = result.correct;
          setFuzzyScore(result.topScore);
        } else if (quiz?.preferredMode === "fuzzy") {
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
        setUserAnswers((prev) => [...prev, answer]);

        try {
          if (!isRetry && quiz) {
            await submitAnswer(quiz.id, {
              questionId: q.id,
              userAnswer: userAnswerText,
              elapsedMillis: 0,
            });
          }
        } catch (err) {
          logger.error("Failed to submit casual answer", err);
        }
      }
    },
    [
      questions,
      currentIndex,
      quiz,
      rankingQuizId,
      judgeAnswer,
      userAnswers,
      router,
      isRetry,
      scorer,
    ],
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("quizAnswers", JSON.stringify(userAnswers));
      }
      router.push("/quiz/score");
    } else {
      setCurrentIndex((i) => i + 1);
      setIsCorrect(null);
      setFuzzyScore(null);
    }
  }, [currentIndex, questions, userAnswers, router]);

  const refreshCurrentQuestion = useCallback(async () => {
    if (!currentQuestion?.collectionId) return;

    try {
      const latestQuestions = await getCollectionQuestions(
        currentQuestion.collectionId,
      );
      const updated = latestQuestions.find((q) => q.id === currentQuestion.id);
      if (!updated) return;

      setQuestions((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q)),
      );
    } catch (err) {
      logger.error("Failed to refresh edited question", err);
    }
  }, [currentQuestion]);

  // Keyboard support for "Next" button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if we are showing the result (isCorrect is not null)
      // and not currently in an input field (to avoid conflicting with text input)
      if (isCorrect !== null && (e.key === "Enter" || e.key === " ")) {
        // If focus is on a button, let the default click happen
        if (document.activeElement?.tagName === "BUTTON") return;

        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCorrect, handleNext]);

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
          <Text variant="h2" weight="bold">
            クイズデータが見つかりません
          </Text>
          <Text color="secondary">
            クイズはスタート画面から始めてください。
          </Text>
          <Button
            variant="solid"
            color="primary"
            onClick={() => router.push("/home")}
          >
            ホームに戻る
          </Button>
        </View>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-surface-muted overflow-y-auto overflow-x-hidden">
      <div className="sticky top-0 left-0 right-0 z-50 bg-surface-muted/90 backdrop-blur-md border-b border-surface-muted/50 overflow-hidden">
        <div className="p-4 flex justify-between items-center relative">
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm("クイズを中断してホームに戻りますか？")) {
                router.push("/home");
              }
            }}
            className="gap-2 text-brand-danger hover:bg-brand-danger/5 active:scale-95 transition-all z-10"
            size="sm"
          >
            <X size={18} />
            <Text variant="body" weight="bold">
              中断
            </Text>
          </Button>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Text variant="body" weight="bold" className="text-secondary">
              {currentIndex + 1} <span className="mx-1 opacity-40">/</span>{" "}
              {questions.length}
            </Text>
          </div>

          <div className="z-10 min-w-[80px] flex justify-end">
            {isCorrect !== null && (
              <Button
                variant="solid"
                color="primary"
                size="sm"
                onClick={handleNext}
                className="gap-2 shadow-brand-sm group active:scale-95 transition-all"
              >
                <span className="font-bold">
                  {currentIndex + 1 === questions.length ? "終了" : "次へ"}
                </span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Button>
            )}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-muted overflow-hidden">
          <div
            className="h-full bg-brand-primary transition-all duration-500 ease-out"
            style={{
              width: `${((currentIndex + (isCorrect !== null ? 1 : 0)) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>
      <View className="flex-1 flex items-center justify-center px-4 py-2">
        {isCorrect !== null ? (
          <Result
            isCorrect={isCorrect}
            correctAnswer={currentQuestion.correctAnswers.join(" / ")}
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
            preferredMode={
              rankingQuizId
                ? "fourChoice"
                : quiz?.preferredMode === "fuzzy"
                  ? "text"
                  : quiz?.preferredMode
            }
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
            void refreshCurrentQuestion();
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}
