import React, { useState } from "react";
import QuestionTextInput from "../Input/QuestionTextInput";
import QuestionDescriptionInput from "../Input/QuestionDescriptionInput";
import EditCompleteDeleteButtons from "../../../common/Buttons/EditCompleteDeleteButtons";
import CorrectAnswerInput from "../Input/CorretAnswerInput";
import { Question, QuestionInput } from "../../../../../types/question";

interface Props {
  question: Question | QuestionInput;
  onEditComplete: (input: QuestionInput) => void;
  onDelete: () => void;
}

const EditCard: React.FC<Props> = ({
  question,
  onEditComplete,
  onDelete
}) => {
  const [input, setInput] = useState<QuestionInput>({
    questionText: question.questionText,
    correctAnswer: question.correctAnswer,
    descriptionText: question.descriptionText
  });

  const handleChange = (field: keyof  QuestionInput, value: string | boolean) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 w-full max-w-3xl mx-auto bg-white space-y-4">
      {/* 上部：名前・開閉・ボタン群 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* 左：名前入力 */}
        <div className="min-w-[200px] max-w-[400px] w-full flex-1">
          <QuestionTextInput
            questionText={input.questionText}
            onQuestionTextInput={(value) => handleChange("questionText", value)}
          />
        </div>

        {/* 右：編集完了・削除ボタン */}
        <div className="ml-auto flex-wrap">
          <EditCompleteDeleteButtons
            onEditComplete={() => onEditComplete(input)}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* 下部：説明入力 */}
      <div className="border-t pt-4 space-y-4">
        <CorrectAnswerInput
          correctAnswer={question.correctAnswer}
          onCorrectAnswerInput={(value) => handleChange("correctAnswer", value)}
        />
        <QuestionDescriptionInput
          description={input.descriptionText}
          onDescriptionInput={(value) => handleChange("descriptionText", value)}
        />
      </div>
    </div>
  );
};

export default EditCard;
