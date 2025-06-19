import React, { useState } from "react";
import EditCard from "../common/Card/EditCard";
import ErrorMessageList from "../../../common/error/ErrorMessageList";
import { ErrorCode, ErrorCodeType } from "../../../../types/error";
import NewBaseCard from "../common/Card/NewBaseCard";
import UnsavedIcon from "../../common/Icon/UnSavedIcon";
import { QuestionInput } from "../../../../types/question";

interface Props {
    question: QuestionInput,
    onDelete: () => void;
    AddPendingChanges: (input: QuestionInput) => void;
    errorMessages: ErrorCode[];
    isOwner: boolean;
}

const NewItemCard: React.FC<Props> = ({
    question,
    onDelete, 
    AddPendingChanges,
    errorMessages = [],
    isOwner,
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(true);
      const [localErrors, setLocalErrors] = useState<ErrorCode[]>([]);

  const validationCheck = (input: QuestionInput): ErrorCode[] => {
    const errors: ErrorCode[] = [];

    if (!("questionText" in input) || input.questionText === "") {
      errors.push({code: ErrorCodeType.QUESTION_TEXT_EMPTY, message: ""});
    }

    return errors;
  };

const onEditComplete = (input: QuestionInput) => {
    const errors = validationCheck(input);

    if (errors.length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors([]);
    AddPendingChanges(input);
    setIsEdit(false);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="flex items-center">
        <div className="mr-2">
            <UnsavedIcon />
        </div>
        <div className="rounded-lg transition-all duration-200 w-full">
          {isEdit && isOwner ? (
            <EditCard
              question={question}
              onEditComplete={(input) => onEditComplete(input)}
              onDelete={() => onDelete()}
            />
          ) : (
            <NewBaseCard
              question={question}
              onEdit={() => setIsEdit(true)}
              onDelete={() => onDelete()}
            />
          )}
        </div>
      </div>
      <ErrorMessageList errorMessages={[...errorMessages, ...localErrors]} />
    </div>
  );
};

export default NewItemCard;