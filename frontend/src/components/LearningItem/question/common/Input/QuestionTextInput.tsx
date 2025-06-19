import React from "react";
import ItemInput from "../../../common/Input/ItemInput";

interface Props {
  questionText?: string;
  onQuestionTextInput: (input: string) => void;
}

const QuestionTextInput: React.FC<Props> = ({
  questionText,
  onQuestionTextInput

}) => {

  return (
    <ItemInput
      placeholder="問題文を入力"
      defaultValue={questionText}
      onInput={onQuestionTextInput}
    />
  );
};

export default QuestionTextInput;