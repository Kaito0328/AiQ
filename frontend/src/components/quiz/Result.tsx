import React from 'react';

interface ExplanationProps {
  isCorrect: boolean;
  correctAnswer: string;
  description: string;
  onNext: () => void;
}

const Result: React.FC<ExplanationProps> = ({ isCorrect, correctAnswer, description, onNext }) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen  bg-gradient-to-t ${isCorrect ? 'from-green-300 to-white' : 'from-red-300 to-white'} p-6`}>
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg text-center transform transition-transform hover:scale-105 duration-300">
        <h2 className={`text-4xl font-semibold ${isCorrect ? 'text-green-500' : 'text-red-500'} transition-opacity duration-500 opacity-100`}>
          {isCorrect ? '正解！' : '不正解'}
        </h2>
        <p className="text-2xl mt-6">{correctAnswer}</p>
        <p className="mt-6 text-lg text-gray-600">{description}</p>
        
        <button
          onClick={onNext}
          className="mt-8 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none transition-transform transform hover:scale-105 ease-in-out"
        >
          次の問題へ
        </button>
      </div>
    </div>
  );
};

export default Result;
