import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Result from './Result';
import QuizQuestion from './QuizQuestion';
import { CasualQuiz } from '../../types/quiz';
import { Question } from '../../types/question';
import { submitAnswer } from '../../api/QuizAPI';
import { AnswerHistory } from '../../types/answerHistory';

const QuizPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { questions?: Question[], quiz?: CasualQuiz, userAnswers?: AnswerHistory[] } | undefined;

  const questions = useMemo(() => state?.questions ?? [], [state]);
  const quiz = state?.quiz ?? null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<AnswerHistory[]>(state?.userAnswers ?? []);

  const [userAnswerText, setUserAnswer] = useState('');
  const isSubmittingRef = useRef(false);

  const navigate = useNavigate();
  const judgeAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const correctAnswers = correctAnswer
      .split(/[,|]/)
      .map(ans => ans.trim().toLowerCase());
    return correctAnswers.includes(normalizedUserAnswer);
  };

  const handleAnswer = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const q = questions[currentIndex];
    const correct = judgeAnswer(userAnswerText, q.correctAnswer);

    setIsCorrect(correct);
    const userAnswer: AnswerHistory = {question: q, userAnswer: userAnswerText, correct};

    setUserAnswers((prev) => [...prev, userAnswer]);
    if (quiz) {
      try {
        await submitAnswer(quiz.quizId, { questionId: q.id, userAnswer: userAnswerText, correct });
      } catch (err) {
        console.error('回答送信に失敗しました', err);
      }
    }
  }, [questions, currentIndex, userAnswerText, quiz]);

  const handleNext = useCallback(() => {
    isSubmittingRef.current = false;
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setIsCorrect(null);
      setUserAnswer('');
    }
  }, [currentIndex, questions.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      e.preventDefault();

      if (isCorrect === null) {
        handleAnswer();
      } else {
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCorrect, handleAnswer, handleNext]);

  
  // ── 完了表示 ───────────────────────────────────────
  useEffect(() => {
    if (isFinished) {
      navigate('/quiz/score', { state: { userAnswers } });
    }
  }, [isFinished, navigate, userAnswers]);

  // ── stateなし・questionsなし対応 ─────────────────────────────────
  if (!state || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">クイズデータがありません</h2>
        <p className="text-gray-600 mb-6">クイズをスタート画面から始めてください。</p>
        {/* ここに「トップへ戻る」ボタンとかも追加できる */}
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full">
      {isCorrect !== null ? (
        <Result
          isCorrect={isCorrect}
          correctAnswer={currentQuestion.correctAnswer}
          description={currentQuestion.descriptionText}
          onNext={handleNext}
        />
      ) : (
        <QuizQuestion
          question={currentQuestion}
          userAnswer={userAnswerText}
          onUserAnswerChange={setUserAnswer}
          onSubmitAnswer={handleAnswer}
        />
      )}
    </div>
  );
};

export default QuizPage;
