import React, { useEffect, useRef } from 'react';

interface ResultProps {
  isCorrect: boolean;
  correctAnswer: string;
  description?: string;
  onNext: () => void;
}

const Result: React.FC<ResultProps> = ({ isCorrect, correctAnswer, description, onNext }) => {
  const hasMovedRef = useRef(false);

  const moveNext = () => {
    if (!hasMovedRef.current) {
      hasMovedRef.current = true;
      onNext();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat) {
        moveNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-t 
      ${isCorrect ? 'from-green-300 to-white' : 'from-red-300 to-white'} p-6`}
    >
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-xl text-center transition-transform transform hover:scale-105 duration-300">
        {/* 正解・不正解タイトル */}
        <h2 className={`text-4xl md:text-5xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'} mb-8`}>
          {isCorrect ? '正解！' : '不正解'}
        </h2>

        {/* 正しい答え */}
        <p className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">{correctAnswer}</p>

        {/* 説明文 */}
        {description && (
          <p className="text-lg text-gray-600 leading-relaxed mb-8">{description}</p>
        )}

        {/* 次の問題へボタン */}
        <button
          onClick={moveNext}
          className="mt-6 px-10 py-4 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-transform transform hover:scale-110"
        >
          次の問題へ
        </button>
      </div>
    </div>
  );
};

export default Result;
