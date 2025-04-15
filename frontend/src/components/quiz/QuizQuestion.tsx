import React, { useState, useRef, useEffect } from 'react';

interface QuizQuestionProps {
  question: string; // クイズの問題
  questionId: number;
  onAnswerSubmit: (userAnswer: string) => void; // 解答後に呼び出すコールバック
  hint: string;
  getNextHint: (questionId: number) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionId,
  onAnswerSubmit,
  hint,
  getNextHint,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false); // ヒントの表示状態
  const answerInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAnswer(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onAnswerSubmit(userAnswer);
    setUserAnswer(''); // 解答後に入力欄をリセット
  };

  const handleHintRequest = () => {
    getNextHint(questionId);
    setShowHint(true);

    if (answerInputRef.current) {
      answerInputRef.current.focus();
    }
  };

  useEffect(() => {
    if (answerInputRef.current) {
      answerInputRef.current.focus();
    }
    setShowHint(false); // 新しい問題が来たらヒントを非表示にする
  }, [question]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-blue-300 to-white p-6">
      {/* 質問エリア */}
      <div className="bg-white shadow-2xl rounded-xl p-10 w-full max-w-xl text-center transform transition-transform hover:scale-105 duration-300">
        <p className="text-4xl font-semibold text-gray-800 mb-6">{question}</p>

        {/* ヒントエリア */}
        <div className="mt-4">
          {showHint && (
            <p className="text-lg text-gray-600 transition-opacity duration-500 opacity-100">{hint}</p>
          )}
          <button
            onClick={handleHintRequest}
            className="mt-4 px-8 py-3 text-lg font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none transition-all ease-in-out transform hover:scale-110"
          >
            ヒントを要求
          </button>
        </div>

        {/* 回答フォーム */}
        <form onSubmit={handleSubmit} className="mt-8">
          <input
            ref={answerInputRef}
            type="text"
            value={userAnswer}
            onChange={handleChange}
            placeholder="答えを入力"
            className="w-full p-4 border-2 border-gray-300 rounded-full text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6 shadow-xl transition-all ease-in-out"
          />
          <button
            type="submit"
            className="w-full mt-4 px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all ease-in-out transform hover:scale-110"
          >
            解答
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizQuestion;
