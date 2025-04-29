import React from 'react';
import { AnswerHistory } from '../../../types/answerHistory';
import AnswerItem from './AnswerItem';

interface AnswerListProps {
  userAnswers: AnswerHistory[];
}

const AnswerList: React.FC<AnswerListProps> = ({ userAnswers }) => {
  return (
    <div className="space-y-6">
    {userAnswers.map((ans, idx) => (
      <AnswerItem key={idx} answer={ans} index={idx + 1} />
    ))}
  </div>
  );
};

export default AnswerList;
