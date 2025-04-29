import React from 'react';
import { FaHome, FaRedo, FaRedoAlt } from 'react-icons/fa';

interface ScoreSummaryProps {
  correctCount: number;
  total: number;
  correctRate: string;
  onGoHome: () => void;
  onRetryIncorrect: () => void;
  onRetryAll: () => void;
}

const ScoreSummary: React.FC<ScoreSummaryProps> = ({
  correctCount,
  total,
  correctRate,
  onGoHome,
  onRetryIncorrect,
  onRetryAll,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">結果発表</h1>
      <p className="text-xl text-center text-gray-600 mb-6">
        {total}問中 {correctCount}問正解 — 正答率 {correctRate}%
      </p>

      {/* プログレスバー */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-8 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-1000"
          style={{ width: `${correctRate}%` }}
        />
      </div>

      <div className="flex justify-center flex-wrap gap-4">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm transition"
        >
          <FaHome />
          <span>ホーム</span>
        </button>
        <button
          onClick={onRetryIncorrect}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 shadow-sm transition"
        >
          <FaRedo />
          <span>間違いだけ再挑戦</span>
        </button>
        <button
          onClick={onRetryAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-sm transition"
        >
          <FaRedoAlt />
          <span>全問再挑戦</span>
        </button>
      </div>
    </div>
  );
};

export default ScoreSummary;
