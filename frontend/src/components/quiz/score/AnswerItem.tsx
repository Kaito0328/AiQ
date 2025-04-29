import React from 'react';
import { AnswerHistory } from '../../../types/answerHistory';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface AnswerItemProps {
  answer: AnswerHistory;
  index: number;
}

const AnswerItem: React.FC<AnswerItemProps> = ({ answer, index }) => {
  return (
    <div className={`p-4 rounded-lg shadow-md transition-colors ${
        answer.correct ? 'bg-green-50' : 'bg-red-50'
      }`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Q{index}: {answer.question.questionText}</span>
        {answer.correct
          ? <FaCheckCircle className="text-green-500" />
          : <FaTimesCircle className="text-red-500" />}
      </div>
      <div className="mb-1"><strong>あなたの回答：</strong> {answer.userAnswer || <em>（なし）</em>}</div>
      <div><strong>正しい回答：</strong> {answer.question.correctAnswer}</div>
      {answer.question.descriptionText && (
        <details className="mt-2 text-sm text-gray-700">
          <summary className="cursor-pointer">解説を表示</summary>
          <p className="mt-1">{answer.question.descriptionText}</p>
        </details>
      )}
    </div>
  );
};

export default AnswerItem;
