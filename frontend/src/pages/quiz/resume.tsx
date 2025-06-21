import React, { useEffect, useState } from 'react';
import { getResumableQuizzes, resumeQuiz } from '../../api/QuizAPI';
import { CasualQuiz } from '../../types/quiz';
import { useNavigate } from 'react-router-dom';
import Paths from '../../routes/Paths';
import ResumeList from '../../components/quiz/resume/ResumeList';
import Page from '../../components/containerComponents/Page';

const ResumableQuizzesList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<CasualQuiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [disabled, setDisabled] = useState<boolean>(false);
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
    setDisabled(true);
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
      setDisabled(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-700">
  //       <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-4" />
  //       <p className="text-lg animate-pulse">中断したクイズを読み込んでいます…</p>
  //     </div>
  //   );
  // }

  // if (quizzes.length === 0) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //         <BaseLabel
  //           label="再開可能なクイズはありません"
  //           style={{
  //             fontWeightKey: FontWeightKey.Bold,
  //             size: {
  //               sizeKey: SizeKey.XL
  //             }
  //           }}
  //         />
  //     </div>
  //   );
  // }

  return (
    <Page
      title={"再開可能なクイズ"}
      loading={loading}
      loadingText='中断したクイズを読み込んでいます...'
    >
      <ResumeList
        quizzes={quizzes}
        handleResumeQuiz={handleResumeQuiz}
        disabled={disabled}
      />  
    </Page>
  );
};

export default ResumableQuizzesList;
