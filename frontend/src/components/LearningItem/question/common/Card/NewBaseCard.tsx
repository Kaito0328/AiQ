import React from "react";
import EditDeleteButtons from "../../../common/Buttons/EditDeleteButtons";
import QuestionTextLabel from "../Label/QuestionTextLabel";
import DescriptionText from "../../../common/Text/DescriptionText";
import { QuestionInput } from "../../../../../types/question";
import CorrectAnswerText from "../Text/CorrectAnswerText";

interface Props {
  question: QuestionInput;
  onEdit: () => void;
  onDelete: () => void;
}

const NewBaseCard: React.FC<Props> = ({
  question,
  onEdit,
  onDelete
}) => {
  return (
    <div className="p-4 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 w-full max-w-3xl mx-auto bg-white space-y-4 bg-yellow-50/60">
      {/* 上部：名前・アイコン・ボタン群 */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        {/* 左：名前・トグル・Open/Favorite */}
        <div className="flex  flex-wrap items-center min-w-0 w-full">
          <div
            className="font-semibold text-gray-800 cursor-pointer hover:underline"
          >
            <QuestionTextLabel questionText={question.questionText} />
          </div>

          <div className="flex flex-col items-end gap-1 text-sm sm:text-base whitespace-nowrap ml-auto">
            <EditDeleteButtons
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
    </div>

    <div className="space-y-4">
      <CorrectAnswerText correctAnswer={question.correctAnswer} />
      <div className="border-t pt-4">
        <DescriptionText description={question.descriptionText} />
      </div>
    </div>
  </div>
  );
};

export default NewBaseCard;
