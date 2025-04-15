import React, { useState, useEffect } from 'react';
import Result from './Result';
import { useLocation } from 'react-router-dom';
import  Score  from './Score';
import QuizQuestion from './QuizQuestion';
import { getQuestionIds, checkAnswer, getNextHint } from '../../api/QuizAPI';
import { Quiz, QuizAnswerResponse } from '../../types/quiz';


interface LocationState {
  selectedCollections: number[];
  questionOrder: 'random' | 'sequential';
  questionCount: number;
}

const QuizPage: React.FC = () => {
  const location = useLocation();
  const { selectedCollections, questionOrder, questionCount } = location.state as LocationState;

  const [quizs, setQuizs] = useState<Quiz[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizAnswerResponse | null>(null);
  const [isEnd, setIsEnd] = useState(false);
  const [hint, setHint] = useState('');

  const fetchQuizs = async () => {
    try {
      const data = await getQuestionIds(selectedCollections, questionOrder, questionCount);
      console.log('Fetched quiz IDs:', data);
      setQuizs(data);
    } catch (error) {
      console.error('Error fetching question IDs:', error);
    }
  };

  // const fetchNextQuestion = async () => {
  //   if (quizs.length === 0) return;

  //   try {
  //     const data = quizs[currentQuestionIndex];
  //     if (data) {
  //       setQuiz(data);
  //       setResult(null);
  //       setHint('');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching next question:', error);
  //   }
  // };

  const handleAnswerSubmit = async (quiz: Quiz, userAnswer: string) => {
    try {
      const response = await checkAnswer(quiz.id, userAnswer);
      setResult(response);
    } catch (error) {
      console.error('Error checking answer:', error);
    }
  };

  const getNextHintText = async (quiz: Quiz) => {
    try {
      const nextChar = await getNextHint(quiz.id, hint.length);
      setHint((prevHint) => prevHint + nextChar);
    } catch (error) {
      console.error('Error fetching hint:', error);
    }
  };

  useEffect(() => {
    fetchQuizs();
  }, []);

  useEffect(() => {
    if (quizs.length > 0) {
      setCurrentQuestionIndex(0);
      setQuiz(quizs[0]);
    }
  }, [quizs]);

  useEffect(() => {
    if (quizs.length <= 0) return;
    console.log('Current question index:', currentQuestionIndex);
    if (currentQuestionIndex < quizs.length) setQuiz(quizs[currentQuestionIndex]);
    else setIsEnd(true);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (result?.correct) {
      setScore((prev) => prev + 1);
    }
  }, [result]);

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setResult(null);
    setHint('');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && result !== null) {
        handleNext(); // エンターキーで次の問題
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown); // クリーンアップ
  }, [result]);

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {!isEnd && quiz ? (
        result ? (
          <Result
            isCorrect={result.correct}
            correctAnswer={result.correctAnswer}
            description={result.description}
            onNext={handleNext}
          />
        ) : (
          <QuizQuestion
            question={quiz.questionText}
            questionId={quiz.id}
            hint={hint}
            getNextHint={() => getNextHintText(quiz)}
            onAnswerSubmit={(userAnswer: string) => handleAnswerSubmit(quiz, userAnswer)}
          />
        )
      ) : (
        <Score score={score} total={quizs.length} />
      )}
    </div>
  );
};

export default QuizPage;
