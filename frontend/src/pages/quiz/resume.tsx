import React, { useEffect, useState } from 'react';
import { getResumableQuizzes, resumeQuiz } from '../../api/QuizAPI';
import { CasualQuiz, filterTypeLabels, sortKeyLabels } from '../../types/quiz';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook, faFilter, faSort, faArrowRight, faHourglassHalf, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Paths from '../../routes/Paths';

const ResumableQuizzesList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<CasualQuiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [resumingQuizId, setResumingQuizId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzesData = await getResumableQuizzes();
        setQuizzes(quizzesData);
      } catch (error) {
        console.error('クイズの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleResumeQuiz = async (quiz: CasualQuiz) => {
    setResumingQuizId(quiz.quizId);
    try {
      const res = await resumeQuiz(quiz.quizId);
      navigate(Paths.QUIZ, {
        state: {
          quiz,
          questions: res.questions,
          userAnswers: res.answers,
        },
      });
    } catch (error) {
      console.error('クイズの再開に失敗しました:', error);
      alert('クイズの再開に失敗しました');
    } finally {
      setResumingQuizId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-700">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-4" />
        <p className="text-lg animate-pulse">中断したクイズを読み込んでいます…</p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <p className="text-gray-600 text-lg">再開可能なクイズはありません。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center text-blue-800">再開可能なクイズ</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {quizzes.map((quiz) => {
            const answered = quiz.totalQuestions - quiz.remainingQuestions;
            const progressPercent = Math.round((answered / quiz.totalQuestions) * 100);

            return (
              <div
                key={quiz.quizId}
                className="p-6 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBook} className="text-blue-500" />
                    {quiz.collectionNames.join(', ')}
                  </h2>
                  <button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
                    onClick={() => handleResumeQuiz(quiz)}
                    disabled={resumingQuizId === quiz.quizId}
                  >
                    {resumingQuizId === quiz.quizId ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        ローディング…
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faArrowRight} />
                        クイズを再開
                      </>
                    )}
                  </button>
                </div>

                <div className="mb-2 text-sm text-gray-700 flex items-center gap-2">
                  <FontAwesomeIcon icon={faHourglassHalf} className="text-yellow-500" />
                  {answered} / {quiz.totalQuestions} 問解答済み
                </div>

                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-blue-500 h-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilter} className="text-green-600" />
                    フィルター: {quiz.filterTypes.map((f) => filterTypeLabels[f] ?? f).join('・')}
                  </p>
                  <p className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faSort} className="text-purple-600" />
                    ソート: {quiz.sortKeys.map((s) => sortKeyLabels[s] ?? s).join('・')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResumableQuizzesList;
