import React from "react";
import ItemInput from "../../../common/Input/ItemInput";
import Text from "../../../../baseComponents/Text";
import { TextColorKey } from "../../../../../types/color";

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
      <Text
        text="解答"
        textColorKey={TextColorKey.Success}
      />
      <ItemInput
        placeholder="正解を入力"
        defaultValue={correctAnswer}
        onInput={onCorrectAnswerInput}
      />

    </div>

  );
};

export default CorrectAnswerInput;