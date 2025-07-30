import React, { useState } from "react";
import BaseCard from "../common/Card/BaseCard";
import EditCard from "../common/Card/EditCard";
import ErrorMessageList from "../../../common/error/ErrorMessageList";
import { ErrorCode } from "../../../../types/error";
import UnsavedIcon from "../../common/Icon/UnSavedIcon";
import { Question, QuestionInput } from "../../../../types/question";

interface Props {
  question: Question,
    isAnswerVisible: boolean,
    onDescriptionToggle: () => void;
    onDelete: () => void;
  AddPendingChanges: (input: QuestionInput) => void;
    errorMessages: ErrorCode[];
    isOwner: boolean;
    isSaved: boolean;
}

const ItemCard: React.FC<Props> = ({
    question,
    isAnswerVisible,
    onDescriptionToggle,
    onDelete, 
    AddPendingChanges,
    errorMessages,
    isOwner,
    isSaved
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const updateEmptyCheck = (input: QuestionInput) => {
      if ("questionText" in input && input.questionText !== question.questionText) return false;
        if ("correctAnswer" in input && input.correctAnswer !== question.correctAnswer) return false;
        if ("descriptionText" in input  && input.descriptionText !== question.descriptionText) return false;
        return true;
    }

    const onEditComplete = (input: QuestionInput) => {
        setIsEdit(false);
        if (updateEmptyCheck(input)) return;
        AddPendingChanges(input);

    }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="flex items-center">
        {!isSaved && <div className="mr-2"><UnsavedIcon /></div>}
        <div className=" rounded-lg transition-all duration-200 w-full">
          {isEdit && isOwner ? (
            <EditCard
              question={question}
              onEditComplete={onEditComplete}
              onDelete={onDelete}
            />
          ) : (
            <BaseCard
              question={question}
              isAnswerVisible={isAnswerVisible}
              isOwner={isOwner}
              onEdit={() => setIsEdit(true)}
              onDelete={onDelete}
              onDescriptionToggle={onDescriptionToggle}
            />
          )}

        </div>
      </div>

      <ErrorMessageList errorMessages={errorMessages} />
    </div>
  );
};

export default ItemCard;