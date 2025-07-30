import React from 'react';
import { CasualQuiz } from '../../../types/quiz';
import ResumeItem from './ResumeItem';

interface ResumeListProps {
  quizzes: CasualQuiz[];
  disabled?: boolean;
  handleResumeQuiz: (quiz: CasualQuiz) => Promise<void>;
}
const ResumeList: React.FC<ResumeListProps> = ({quizzes, disabled, handleResumeQuiz}) => {
  return (
    <div className="min-h-screen flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full  gap-5 p-2">
          {quizzes.map((quiz) => (
            <ResumeItem
                quiz={quiz}
                disabled={disabled}
                handleResumeQuiz={() => handleResumeQuiz(quiz)}

            />
          ))}
        </div>
      </div>
  );
};

export default ResumeList;
