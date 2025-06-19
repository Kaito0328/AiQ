import React from "react";
import ItemInput from "../../../common/Input/ItemInput";
import Text from "../../../../baseComponents/Text";

interface Props {
  description?: string;
  onDescriptionInput: (input: string) => void;
}

const QuestionDescriptionInput: React.FC<Props> = ({
  description,
  onDescriptionInput

}) => {

  return (
    <div>
      <Text
        text="説明"
      />
      <ItemInput
        placeholder="コレクションセットの説明を入力"
        defaultValue={description}
        onInput={onDescriptionInput}
      />

    </div>

  );
};

export default QuestionDescriptionInput;
