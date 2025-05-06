import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Loading from '../../components/quiz/Loading';
import { startCasualQuiz } from '../../api/QuizAPI';
import { CasualQuiz, QuizRequest } from '../../types/quiz';
import { Question } from '../../types/question';
import './QuizStartPage.css'; // CSS追加！

const QuizStartPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<CasualQuiz | null>(null);
  const [loading, setLoading] = useState(true);

  const [fadeOut, setFadeOut] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const collectionIds = searchParams.get('collectionIds')?.split(',').map(Number) ?? [];
        const limit = parseInt(searchParams.get('limit') ?? '10', 10);
        const filters = JSON.parse(searchParams.get('filters') ?? '[]');
        const sorts = JSON.parse(searchParams.get('sorts') ?? '[]');
        const req: QuizRequest = { collectionIds, filters, sorts, limit };

        const res = await startCasualQuiz(req);
        setQuestions(res.questions);
        setQuiz(res.quiz);
      } catch (err) {
        console.error('クイズ取得に失敗しました', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  const handleStartQuiz = () => {
    if (!quiz) return;
    setFadeOut(true); // フェードアウト開始

    setTimeout(() => {
      navigate('/quiz', {
        state: {
          quiz,
          questions,
        },
      });
    }, 800); // アニメーションに合わせて遅延
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-100 to-emerald-300">
        <Loading />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-300 transition-all duration-700 ${fadeOut ? 'tv-fade-out' : 'tv-fade-in'}`}>
      <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md w-full animate-fade-in">
        <h1 className="text-3xl font-bold text-emerald-700 mb-6">クイズの準備ができました！</h1>
        <button
          onClick={handleStartQuiz}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          クイズを開始する
        </button>
      </div>
    </div>
  );
};

export default QuizStartPage;
