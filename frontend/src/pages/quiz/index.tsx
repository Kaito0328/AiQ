import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Result from '../../components/quiz/result/Result';
import { CasualQuiz } from '../../types/quiz';
import { Question } from '../../types/question';
import { submitAnswer } from '../../api/QuizAPI';
import { AnswerHistory } from '../../types/answerHistory';
import Paths from '../../routes/Paths';
import QuizForm from '../../components/quiz/quizForm/QuizForm';
import Page from '../../components/containerComponents/Page';
import { ColorKey } from '../../style/colorStyle';

const QuizPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { questions?: Question[], quiz?: CasualQuiz, userAnswers?: AnswerHistory[] } | undefined;

  const questions = useMemo(() => state?.questions ?? [], [state]);
  const quiz = state?.quiz ?? null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<AnswerHistory[]>(state?.userAnswers ?? []);

  const navigate = useNavigate();
  const judgeAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const correctAnswers = correctAnswer
      .split(/[,|]/)
      .map(ans => ans.trim().toLowerCase());
    return correctAnswers.includes(normalizedUserAnswer);
  };

  const handleAnswer = useCallback(async (userAnswerText: string) => {
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
  }, [questions, currentIndex, quiz]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setIsCorrect(null);
    }
  }, [currentIndex, questions.length]);

  useEffect(() => {
    if (isFinished) {
      navigate('/quiz/score', { state: { userAnswers } });
    }
  }, [isFinished, navigate, userAnswers]);

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
  const resultColorKey = (isCorrect === null ) ? ColorKey.Base : (isCorrect ? ColorKey.Success : ColorKey.Danger);
  return (
    <Page
      style={{
        colorKey: resultColorKey
      }}
    >
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-[90%] max-w-200">
          {isCorrect !== null ? (
            <Result
              isCorrect={isCorrect}
              correctAnswer={currentQuestion.correctAnswer}
              description={currentQuestion.descriptionText}
              onNext={handleNext}
            />
          ) : (
            <QuizForm
              questionText={currentQuestion.questionText}
              correctAnswer={currentQuestion.correctAnswer}
              onSubmitAnswer={handleAnswer}
            />
          )}
        </div>
      </div>
    </Page>
    
  );
};

export default QuizPage;
