import React, { useEffect, useRef, useState } from 'react';
import { Question } from '../../types/question';

interface QuizQuestionProps {
  question: Question;
  userAnswer: string;
  onUserAnswerChange: (userAnswer: string) => void;
  onSubmitAnswer: (userAnswer: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, userAnswer, onUserAnswerChange, onSubmitAnswer }) => {
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const answerRef = useRef<HTMLInputElement>(null);
  const isSubmitting = useRef(false);

  useEffect(() => {
    onUserAnswerChange('');
    setHint('');
    setShowHint(false);
    isSubmitting.current = false;
    answerRef.current?.focus();
  }, [question]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.repeat) {
      e.preventDefault();
      e.stopPropagation();
      if (!isSubmitting.current) {
        isSubmitting.current = true;
        onSubmitAnswer(userAnswer.trim());
        answerRef.current?.blur(); 
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-white flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl px-8 py-10 w-120 max-w-2xl text-center transition-transform transform hover:scale-105 duration-300">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 max-w-prose mx-auto text-left md:text-center">
          {question.questionText}
        </h1>

        {showHint && (
          <div className="mb-6 text-base md:text-lg text-blue-600 font-semibold animate-pulse">
            {hint}
          </div>
        )}

        <form
          className="flex flex-col items-center space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isSubmitting.current) {
              isSubmitting.current = true;
              onSubmitAnswer(userAnswer.trim());
              answerRef.current?.blur();
            }
          }}
        >
          <input
            ref={answerRef}
            type="text"
            value={userAnswer}
            onChange={(e) => onUserAnswerChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ここに答えを入力..."
            className="w-full max-w-md px-6 py-4 border-2 border-gray-300 rounded-full text-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-lg transition-all"
          />

          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (hint.length < question.correctAnswer.length) {
                  setHint((h) => h + question.correctAnswer[h.length]);
                  setShowHint(true);
                  answerRef.current?.focus();
                }
              }}
              className="px-6 py-3 bg-yellow-400 text-white font-bold rounded-full hover:bg-yellow-500 transition-transform transform hover:scale-110"
            >
              ヒントを見る
            </button>

            <button
              type="submit"
              className="px-8 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-transform transform hover:scale-110"
            >
              解答する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizQuestion;
