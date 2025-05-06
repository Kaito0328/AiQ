import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnswerHistory } from '../../types/answerHistory';
import ScoreSummary from '../../components/quiz/score/ScoreSummary';
import AnswerList from '../../components/quiz/score/AnswerList';
import { Question } from '../../types/question';
import Paths from '../../routes/Paths';


const ScorePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userAnswers: AnswerHistory[] = location.state?.userAnswers ?? [];

  const correctCount = userAnswers.filter(ans => ans.correct).length;
  const total = userAnswers.length;
  const correctRate = total > 0 ? ((correctCount / total) * 100).toFixed(1) : '0.0';

  const handleRetryIncorrect = () => {
    const incorrectQuestions: Question[] = userAnswers
      .filter(ans => !ans.correct)
      .map(ans => ans.question);

    navigate(Paths.QUIZ, { state: { questions: incorrectQuestions } });
  };

  const handleRetryAll = () => {
    const allQuestions: Question[] = userAnswers.map(ans => ans.question);
    navigate(Paths.QUIZ, { state: { questions: allQuestions } });
  };

  const handleGoHome = () => {
    navigate(Paths.HOME);
  };

  if (!userAnswers || userAnswers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">⚠️ アクセスエラー</h1>
        <p className="text-gray-600 mb-8">クイズを解いた後にこのページを表示できます。</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/')}
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
    {/* 上部：固定させたいサマリー */}
    <div className="flex-none">
            <ScoreSummary
            correctCount={correctCount}
            total={total}
            correctRate={correctRate}
            onGoHome={handleGoHome}
            onRetryIncorrect={handleRetryIncorrect}
            onRetryAll={handleRetryAll}
            />
        </div>

        {/* 下部：スクロールさせたいリスト */}
        <div className="flex-1 overflow-y-auto px-4 mt-10">
            <AnswerList userAnswers={userAnswers} />
        </div>
    </div>
  );
};

export default ScorePage;
