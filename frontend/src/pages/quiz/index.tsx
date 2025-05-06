import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Result from '../../components/quiz/Result';
import QuizQuestion from '../../components/quiz/QuizQuestion';
import { CasualQuiz } from '../../types/quiz';
import { Question } from '../../types/question';
import { submitAnswer } from '../../api/QuizAPI';
import { AnswerHistory } from '../../types/answerHistory';
import Paths from '../../routes/Paths';

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
    const userAnswer: AnswerHistory = { question: q, userAnswer: userAnswerText, correct };

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

  useEffect(() => {
    if (isFinished) {
      navigate('/quiz/score', { state: { userAnswers } });
    }
  }, [isFinished, navigate, userAnswers]);

  // ── stateなし・questionsなし対応 ──────────────────────────────
  if (!state || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-white px-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
          <h2 className="mt-7 text-2xl font-bold mb-2 text-gray-800">クイズデータが見つかりません</h2>
          <p className="text-gray-600 mb-6">クイズはスタート画面から始めてください。</p>
          <button
            onClick={() => navigate(Paths.HOME)}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
      <div>
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
