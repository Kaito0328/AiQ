import React from "react";
import EditDeleteButtons from "../../../common/Buttons/EditDeleteButtons";
import QuestionTextLabel from "../Label/QuestionTextLabel";
import IdLabel from "../../../common/Text/IdText";
import DescriptionText from "../../../common/Text/DescriptionText";
import AnswerToggleButton from "../Button/AnswerToggleButton";
import CorrectAnswerText from "../Text/CorrectAnswerText";
import { Question } from "../../../../../types/question";

interface Props {
  question: Question;
  isAnswerVisible: boolean;
  isOwner: boolean;
  onDescriptionToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BaseCard: React.FC<Props> = ({
  question,
  isAnswerVisible,
  isOwner,
  onDescriptionToggle,
  onEdit,
  onDelete
}) => {
  return (
<div className="p-4 rounded-xl shadow-md hover:shadow-lg transition w-full max-w-3xl mx-auto bg-white space-y-2">
  {/* ヘッダー：問題文とトグル */}
  <div className="flex flex-wrap items-start justify-between gap-2">
    {/* 左：問題文（flex-growで可変） */}
    <div className="flex-1 break-words font-semibold">
      <QuestionTextLabel questionText={question.questionText} />
    </div>

    {/* 右：ボタン群（固定幅） */}
    <div className="flex flex-col items-end gap-1 shrink-0">
      <AnswerToggleButton
        isVisible={isAnswerVisible}
        onToggle={onDescriptionToggle}
      />
      {isOwner && (
        <EditDeleteButtons
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  </div>

  {/* 解答と説明文（トグル表示） */}
  {isAnswerVisible && (
    <div className="space-y-4">
      <CorrectAnswerText correctAnswer={question.correctAnswer} />
      <div className="border-t pt-4">
        <DescriptionText description={question.descriptionText} />
      </div>
    </div>
  )}

  <IdLabel id={question.id} />
</div>
  );
};

export default BaseCard;
