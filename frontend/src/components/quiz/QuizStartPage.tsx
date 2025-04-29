import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Loading from './Loading';
import { startCasualQuiz } from '../../api/QuizAPI';
import { CasualQuiz, QuizRequest } from '../../types/quiz';
import { Question } from '../../types/question';

const QuizStartPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<CasualQuiz | null>(null);
  const [loading, setLoading] = useState(true);

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

    navigate('/quiz', {
      state: {
        quiz,
        questions,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-8">クイズの準備ができました！</h1>
      <button
        onClick={handleStartQuiz}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded"
      >
        クイズを開始する
      </button>
    </div>
  );
};

export default QuizStartPage;
