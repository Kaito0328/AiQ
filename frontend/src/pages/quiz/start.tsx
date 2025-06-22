import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { startCasualQuiz } from '../../api/QuizAPI';
import { CasualQuiz, QuizRequest } from '../../types/quiz';
import { Question } from '../../types/question';
import './QuizStartPage.css'; // CSS追加！
import Page from '../../components/containerComponents/Page';
import BaseButton from '../../components/common/button/BaseButton';
import { CoreColorKey } from '../../style/colorStyle';
import { SizeKey } from '../../style/size';
import { FontWeightKey } from '../../style/fontWeight';

const QuizStartPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<CasualQuiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    setTimeout(() => {
      navigate('/quiz', {
        state: {
          quiz,
          questions,
        },
      });
    }, 800); // アニメーションに合わせて遅延
  };
  return (
    <Page
      loading={loading}
      loadingText='クイズを取得中...'
    >
      <div className="w-full min-h-screen flex justify-center items-center">
        <BaseButton
          label={"クイズを開始する"}
          onClick={handleStartQuiz}
          style={{
            color: {
              colorKey: CoreColorKey.Success,
            },
            size: {
              sizeKey: SizeKey.LG
            },
            fontWeightKey: FontWeightKey.Bold
          }}
          bg_color={true}
        />
      </div>
    </Page>
  );
};

export default QuizStartPage;
