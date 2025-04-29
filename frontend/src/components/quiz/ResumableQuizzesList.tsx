import React, { useEffect, useState } from 'react';
import { getResumableQuizzes, resumeQuiz } from './../../api/QuizAPI'; // API関数をインポート
import { CasualQuiz } from './../../types/quiz'; // CasualQuiz型をインポート
import { useNavigate } from 'react-router-dom';

const ResumableQuizzesList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<CasualQuiz[]>([]); // クイズデータの状態管理
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態
  const navigate = useNavigate();

  // クイズの一覧を取得する関数
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzesData = await getResumableQuizzes();
        setQuizzes(quizzesData); // 取得したクイズデータをステートにセット
        console.log(quizzesData);
      } catch (error) {
        console.error('クイズの取得に失敗しました:', error);
      } finally {
        setLoading(false); // ローディング終了
      }
    };

    fetchQuizzes(); // クイズ一覧の取得を実行
  }, []);

  // クイズを再開する関数
  const handleResumeQuiz = async (quiz: CasualQuiz) => {
    try {
      const res = await resumeQuiz(quiz.quizId); // クイズを再開

      navigate('/quiz', {
        state: {
          quiz,
          questions: res.questions,
          userAnswers: res.answers
        },
      });
    } catch (error) {
      console.error('クイズの再開に失敗しました:', error);
      alert('クイズの再開に失敗しました');
    }
  };

  // ローディング中またはクイズがない場合のUI
  if (loading) {
    return <div>クイズを読み込んでいます...</div>;
  }

  if (quizzes.length === 0) {
    return <div>再開可能なクイズはありません。</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">再開可能なクイズ一覧</h1>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.quizId} className="mb-4 p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">{quiz.collectionNames.join(', ')}</h2>
            <p className="text-lg mt-2">全{quiz.totalQuestions}問中、残り{quiz.remainingQuestions}問</p>
            <p className="text-sm text-gray-500">フィルター: {quiz.filterTypes.join(', ')}</p>
            <p className="text-sm text-gray-500">ソート: {quiz.sortKeys.join(', ')}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
              onClick={() => handleResumeQuiz(quiz)}
            >
              クイズを再開
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResumableQuizzesList;
