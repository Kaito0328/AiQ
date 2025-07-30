import React from "react";
import ItemInput from "../../../common/Input/ItemInput";
import BaseLabel from "../../../../baseComponents/BaseLabel";

interface Props {
  correctAnswer?: string;
  onCorrectAnswerInput: (input: string) => void;
}

const CorrectAnswerInput: React.FC<Props> = ({
  correctAnswer,
  onCorrectAnswerInput

}) => {

  return (
    <div>
      <BaseLabel
        label="解答"
      />
      <ItemInput
        placeholder="コレクションセットの説明を入力"
        defaultValue={correctAnswer}
        onInput={onCorrectAnswerInput}
      />

    </div>

  );
};

export default CorrectAnswerInput;
